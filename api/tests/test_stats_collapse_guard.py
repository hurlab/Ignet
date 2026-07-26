"""Tests for the stats collapse guard.

Regression cover for the 2026-07-25 incident: the nightly loader deletes-then-
reloads rows, so a COUNT(*) issued mid-load observed a partially populated
t_gene_pairs. That snapshot was cached under a 24 h TTL, and the landing page
served 573,167 gene pairs against an actual 6,151,660 for ~7 hours.

The guard rejects an implausible collapse instead of caching it, so a partial
read costs one request rather than a day of wrong numbers.
"""
from routes.stats import (
    _COLLAPSE_RATIO,
    _LAST_GOOD_SUFFIX,
    _accept_count,
)


class FakeRedis:
    """Minimal Redis stand-in recording writes and their TTLs."""

    def __init__(self, initial=None):
        self.store = dict(initial or {})
        self.ttls = {}

    def get(self, key):
        return self.store.get(key)

    def set(self, key, value, ex=None):
        self.store[key] = value
        self.ttls[key] = ex


KEY = "ignet:stats:total_interactions"
LAST_GOOD_KEY = KEY + _LAST_GOOD_SUFFIX


def test_first_ever_count_is_accepted_and_seeds_last_good():
    """With no history there is nothing to compare against, so accept."""
    redis = FakeRedis()

    assert _accept_count(redis, KEY, 6_151_660) == 6_151_660
    assert redis.store[KEY] == "6151660"
    assert redis.store[LAST_GOOD_KEY] == "6151660"


def test_growth_is_accepted_and_advances_last_good():
    """The corpus grows daily; a larger count must update both keys."""
    redis = FakeRedis({LAST_GOOD_KEY: "6151660"})

    assert _accept_count(redis, KEY, 6_164_988) == 6_164_988
    assert redis.store[LAST_GOOD_KEY] == "6164988"


def test_partial_table_read_is_rejected_and_not_cached():
    """The actual incident: 573,167 observed against a real 6,151,660."""
    redis = FakeRedis({LAST_GOOD_KEY: "6151660"})

    served = _accept_count(redis, KEY, 573_167)

    # Serves the last known good value, never the partial read.
    assert served == 6_151_660
    # And critically does NOT pin the bad number under the 24 h TTL.
    assert KEY not in redis.store
    assert redis.store[LAST_GOOD_KEY] == "6151660"


def test_modest_decrease_is_still_accepted():
    """Real cleanups shrink tables; only an implausible collapse is rejected."""
    redis = FakeRedis({LAST_GOOD_KEY: "1000"})
    just_above_threshold = int(1000 * _COLLAPSE_RATIO) + 1

    assert _accept_count(redis, KEY, just_above_threshold) == just_above_threshold
    assert redis.store[KEY] == str(just_above_threshold)


def test_last_good_is_written_without_a_ttl():
    """The vetting baseline must outlive the cache entry it vets."""
    redis = FakeRedis()

    _accept_count(redis, KEY, 6_151_660)

    assert redis.ttls[KEY] is not None      # cache entry expires
    assert redis.ttls[LAST_GOOD_KEY] is None  # baseline persists


def test_guard_is_inert_when_redis_is_unavailable():
    """Redis is optional; the endpoint must still serve a live count."""
    assert _accept_count(None, KEY, 6_151_660) == 6_151_660

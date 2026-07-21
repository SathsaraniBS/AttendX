"""
AttendX — pytest configuration
"""
import pytest
import sys
import os

# ✅ Server path add
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def pytest_configure(config):
    """pytest start print"""
    print("\n")
    print("=" * 55)
    print("🧪 AttendX Test Suite Starting...")
    print("=" * 55)


def pytest_terminal_summary(terminalreporter, exitstatus, config):
    """Test results summary"""
    passed  = len(terminalreporter.stats.get('passed',  []))
    failed  = len(terminalreporter.stats.get('failed',  []))
    skipped = len(terminalreporter.stats.get('skipped', []))
    print("\n")
    print("=" * 55)
    print(f"✅ Passed  : {passed}")
    print(f"❌ Failed  : {failed}")
    print(f"⏭️  Skipped : {skipped}")
    print("=" * 55)
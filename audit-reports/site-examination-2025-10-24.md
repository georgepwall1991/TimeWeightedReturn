# Site Examination Report

**Generated:** 2025-10-24T14:56:30.733Z

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 0 |
| 🟡 Medium | 2 |
| 🔵 Low | 0 |
| ✅ Passed | 5 |
| **Total Issues** | **2** |

## Network Errors (2)

### 1. Failed - http://localhost:5011/api/user/preferences

**Failure:** net::ERR_ABORTED

### 2. Failed - http://localhost:5011/api/auth/me

**Failure:** net::ERR_ABORTED

## 🟡 Medium Priority Issues

### 1. Dark Mode Issues: dashboard

Some elements do not properly support dark mode

**Screenshot:** `screenshots/examination/1761317787123-dashboard-dark.png`

<details>
<summary>View Details (4 items)</summary>

- {
  "issue": "Black text in dark mode",
  "element": "BODY",
  "text": "Portfolio AnalyticsLoading..."
}
- {
  "issue": "Black text in dark mode",
  "element": "DIV",
  "text": "Portfolio AnalyticsLoading..."
}
- {
  "issue": "Black text in dark mode",
  "element": "DIV.min-h-screen",
  "text": "Portfolio AnalyticsLoading..."
}
- {
  "issue": "Black text in dark mode",
  "element": "DIV.text-center",
  "text": "Portfolio AnalyticsLoading..."
}

</details>

### 2. Responsive Issues on Mobile (375x667)

Layout problems detected on 375x667

<details>
<summary>View Details (1 items)</summary>

- {
  "issue": "Element extends beyond viewport",
  "element": "DIV.flex",
  "right": 413.828125,
  "viewportWidth": 375
}

</details>

## ⚡ Performance Metrics

| Page | DOM Content Loaded | Page Load | Resources |
|------|-------------------|-----------|----------|
| Main Dashboard | 20ms | 20ms | 36 |

## ✅ Passed Checks (5)

- Form validation working correctly (2 validation checks active)
- Accessibility checks passed
- Keyboard navigation appears properly implemented
- Color contrast meets WCAG AA requirements
- Analytics section accessible

## 📋 Recommendations

Priority action items:

3. Review medium priority issues - improve visual consistency and UX

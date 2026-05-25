// #region agent log
const DEBUG_ENDPOINT = 'http://127.0.0.1:7816/ingest/cdffcd90-ddc6-47d0-83d4-59065e3e6c4e';
const DEBUG_SESSION = 'd77f92';

export function debugLog(location, message, data = {}, hypothesisId = '') {
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': DEBUG_SESSION,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION,
      location,
      message,
      data,
      hypothesisId,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion

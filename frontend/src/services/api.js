const API_BASE_URL = 'http://127.0.0.1:8000';

async function handleResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error || payload?.detail || 'Request failed.';
    throw new Error(message);
  }
  return payload;
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
}

export async function analyzeText(text) {
  const response = await fetch(`${API_BASE_URL}/api/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return handleResponse(response);
}

export async function analyzeVoice(audioBlob) {
  const formData = new FormData();
  const extension = audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
  formData.append('file', audioBlob, `recording.${extension}`);

  const response = await fetch(`${API_BASE_URL}/api/voice-triage`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function createCase(data) {
  const response = await fetch(`${API_BASE_URL}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function createVoiceCase(audioBlob, data) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  if (data.farmer_name) formData.append('farmer_name', data.farmer_name);
  if (data.farmer_phone) formData.append('farmer_phone', data.farmer_phone);
  if (data.latitude !== undefined && data.latitude !== null) formData.append('latitude', String(data.latitude));
  if (data.longitude !== undefined && data.longitude !== null) formData.append('longitude', String(data.longitude));
  if (data.address) formData.append('address', data.address);

  const response = await fetch(`${API_BASE_URL}/api/voice-case`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function getCases() {
  const response = await fetch(`${API_BASE_URL}/api/cases`);
  return handleResponse(response);
}

export async function getCase(caseId) {
  const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`);
  return handleResponse(response);
}

export async function getCaseQueue() {
  const response = await fetch(`${API_BASE_URL}/api/cases`);
  const payload = await handleResponse(response);
  const queue = { critical: [], urgent: [], non_urgent: [], unknown: [] };

  for (const caseItem of payload.cases || []) {
    if (!['WAITING', 'ASSIGNED'].includes(caseItem.status)) continue;
    const urgency = String(caseItem.urgency || 'UNKNOWN').toUpperCase();
    const key = urgency === 'CRITICAL'
      ? 'critical'
      : urgency === 'URGENT'
        ? 'urgent'
        : urgency === 'NON_URGENT'
          ? 'non_urgent'
          : 'unknown';
    queue[key].push(caseItem);
  }

  return { success: true, queue };
}

export async function assignCase(caseId) {
  const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/assign`, {
    method: 'POST',
  });
  return handleResponse(response);
}

export async function completeCase(caseId) {
  const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/complete`, {
    method: 'POST',
  });
  return handleResponse(response);
}

export async function cancelCase(caseId) {
  const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/cancel`, {
    method: 'POST',
  });
  return handleResponse(response);
}

export async function getVets() {
  const response = await fetch(`${API_BASE_URL}/api/vets`);
  return handleResponse(response);
}

export async function addVet(data) {
  const response = await fetch(`${API_BASE_URL}/api/vets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateVetStatus(vetId, status) {
  const response = await fetch(`${API_BASE_URL}/api/vets/${vetId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

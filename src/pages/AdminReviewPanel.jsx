import React, { useEffect, useState, useRef } from 'react';
const API = import.meta.env.VITE_API_URL;
/**
 * AdminReviewPanel.jsx
 * - Single-file React component for admin review workflow
 * - Uses Tailwind classes for styling
 * - Assumes backend endpoints (from previous backend setup):
 *   POST   /api/admin/upload            (multipart 'file')
 *   GET    /api/admin/documents
 *   GET    /api/admin/documents/:id
 *   PUT    /api/admin/questions/:id    (body { questionText, answerText, marks, qtype })
 *   DELETE /api/admin/questions/:id
 *   POST   /api/admin/questions/:id/image (multipart 'image')  <-- optional endpoint to implement in backend
 *
 * Notes:
 * - This component focuses on review/edit/replace image before final save.
 * - It provides inline edit, accept/reject toggles, and a simple image-replace flow.
 * - For cropping, backend should provide an endpoint to accept a crop from a page image. If not available, admin can upload replacement images.
 */

export default function AdminReviewPanel() {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/documents`);
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMessage('Failed to load documents');
    } finally { setLoading(false); }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return setMessage('Please choose a PDF file');
    const fd = new FormData();
    fd.append('file', file);
    try {
      setUploading(true);
      setMessage('Uploading and processing... this may take a few seconds');
      const res = await fetch(`${API}/api/admin/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setMessage(`Uploaded. ${data.questionCount || 0} questions parsed.`);
      // refresh documents and auto-open new one
      await fetchDocuments();
      if (data.document && data.document.id) {
        setTimeout(() => selectDocument(data.document.id), 600);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Upload error');
    } finally { setUploading(false); fileRef.current.value = ''; setFile(null); }
  }

  async function selectDocument(id) {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/documents/${id}`);
      const doc = await res.json();
      setSelectedDoc(doc);
      // Fetch its questions separately if not included
      if (doc && doc.Questions) {
        setQuestions(doc.Questions || []);
      } else {
        // fallback: GET endpoint may include questions
        const resQ = await fetch(`${API}/api/admin/documents/${id}`);
        const jsonQ = await resQ.json();
        setQuestions(jsonQ.Questions || jsonQ.questions || []);
      }
      setMessage('Loaded document');
    } catch (e) {
      console.error(e);
      setMessage('Failed to load document details');
    } finally { setLoading(false); }
  }

  function beginEdit(idx) {
    const qlist = [...questions];
    qlist[idx].editing = true;
    setQuestions(qlist);
  }
  function cancelEdit(idx) {
    const qlist = [...questions];
    qlist[idx].editing = false;
    setQuestions(qlist);
  }

  async function saveQuestion(idx) {
    const q = questions[idx];
    try {
      const res = await fetch(`${API}/api/admin/questions/${q.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText: q.questionText, answerText: q.answerText, marks: q.marks, qtype: q.qtype })
      });
      if (!res.ok) throw new Error('Failed saving');
      const updated = await res.json();
      const qlist = [...questions]; qlist[idx] = { ...updated, editing: false }; setQuestions(qlist);
      setMessage('Saved');
    } catch (e) {
      console.error(e); setMessage('Save failed');
    }
  }

  async function deleteQuestion(idx) {
    if (!confirm('Delete this question?')) return;
    const q = questions[idx];
    try {
      const res = await fetch(`${API}/api/admin/questions/${q.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      const qlist = questions.filter(x => x.id !== q.id);
      setQuestions(qlist);
      setMessage('Deleted');
    } catch (e) { console.error(e); setMessage('Delete failed'); }
  }

  // mark accept/reject flags locally and optionally send to backend when saving
  function toggleAccept(idx) {
    const qlist = [...questions]; qlist[idx].accepted = !qlist[idx].accepted; setQuestions(qlist);
  }

  // Replace image: simple upload flow (backend needs endpoint to accept replacement images)
  async function handleReplaceImage(idx, fileInput) {
    const q = questions[idx];
    if (!fileInput.files || fileInput.files.length === 0) return setMessage('Choose an image file');
    const fd = new FormData();
    fd.append('image', fileInput.files[0]);
    try {
      setMessage('Uploading image...');
      const res = await fetch(`${API}/api/admin/questions/${q.id}/image`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      // update question images list locally (backend should return inserted image row)
      const qlist = [...questions];
      qlist[idx].QuestionImages = qlist[idx].QuestionImages || [];
      qlist[idx].QuestionImages.push(data);
      setQuestions(qlist);
      setMessage('Image replaced/added');
    } catch (e) { console.error(e); setMessage(e.message || 'Image upload failed'); }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Review Panel</h1>

        <div className="bg-white p-4 rounded shadow mb-6">
          <form onSubmit={handleUpload} className="flex gap-3 items-center">
            <input ref={fileRef} type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} className="" />
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload & Parse'}</button>
            <div className="text-sm text-gray-600 ml-4">Tip: Use high-quality PDF for best extraction.</div>
          </form>
          <div className="mt-2 text-sm text-gray-700">{message}</div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 bg-white p-4 rounded shadow h-[60vh] overflow-auto">
            <h2 className="font-semibold mb-2">Documents</h2>
            {loading && <div>Loading...</div>}
            {!loading && docs.length === 0 && <div className="text-sm text-gray-500">No documents yet.</div>}
            <ul>
              {docs.map(doc => (
                <li key={doc.id} className={`p-2 rounded hover:bg-gray-50 cursor-pointer ${selectedDoc && selectedDoc.id === doc.id ? 'bg-gray-100' : ''}`} onClick={() => selectDocument(doc.id)}>
                  <div className="text-sm font-medium">{doc.filename}</div>
                  <div className="text-xs text-gray-500">Status: {doc.status || 'uploaded'}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 bg-white p-4 rounded shadow h-[60vh] overflow-auto">
            <h2 className="font-semibold mb-3">{selectedDoc ? `Review: ${selectedDoc.filename}` : 'Select a document to review'}</h2>

            {!selectedDoc && <div className="text-sm text-gray-600">Click a document on the left to load parsed questions and images.</div>}

            {selectedDoc && (
              <div>
                <div className="mb-3 text-sm text-gray-500">Document ID: {selectedDoc.id} &nbsp; | &nbsp; Uploaded: {new Date(selectedDoc.createdAt).toLocaleString()}</div>

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="border rounded p-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          {q.editing ? (
                            <textarea value={q.questionText} onChange={e => { const copy = [...questions]; copy[idx].questionText = e.target.value; setQuestions(copy); }} className="w-full p-2 border rounded" rows={3} />
                          ) : (
                            <div className="text-sm font-medium">{q.questionText}</div>
                          )}
                          <div className="mt-2 text-sm text-gray-600">Answer: {q.answerText || <em className="text-gray-400">(none)</em>}</div>
                          <div className="mt-1 text-xs text-gray-500">Marks: {q.marks || '—'} &nbsp; | &nbsp; Type: {q.qtype || '—'}</div>
                        </div>

                        <div className="w-48">
                          <div className="mb-2">
                            {q.QuestionImages && q.QuestionImages.length > 0 ? (
                              <div className="space-y-2">
                                {q.QuestionImages.map(img => (
                                  <img key={img.id || img.gcsUri} src={img.gcsUri} alt="diagram" className="w-full h-28 object-contain border" />
                                ))}
                              </div>
                            ) : (
                              <div className="w-full h-28 flex items-center justify-center bg-gray-50 border text-xs text-gray-400">No image</div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {q.editing ? (
                              <>
                                <button onClick={() => saveQuestion(idx)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Save</button>
                                <button onClick={() => cancelEdit(idx)} className="px-2 py-1 bg-gray-200 rounded text-xs">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => beginEdit(idx)} className="px-2 py-1 bg-yellow-400 text-black rounded text-xs">Edit</button>
                                <button onClick={() => deleteQuestion(idx)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
                              </>
                            )}
                          </div>

                          <div className="mt-2 space-y-2">
                            <label className="block text-xs text-gray-600">Replace / Upload Image</label>
                            <input type="file" accept="image/*" onChange={(e) => handleReplaceImage(idx, e.target)} className="text-xs" />
                          </div>

                          <div className="mt-2 flex gap-2">
                            <button onClick={() => toggleAccept(idx)} className={`px-2 py-1 rounded text-xs ${q.accepted ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>{q.accepted ? 'Accepted' : 'Accept'}</button>
                            <button onClick={() => { const copy = [...questions]; copy[idx].rejected = true; setQuestions(copy); }} className={`px-2 py-1 rounded text-xs ${q.rejected ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>Reject</button>
                          </div>

                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

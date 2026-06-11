import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import {
  MdClose, MdCheck, MdCameraAlt,
  MdFaceRetouchingNatural, MdRefresh,
  MdCheckCircle, MdCancel, MdWarning
} from 'react-icons/md';

export default function FaceRegisterModal({ isOpen, onClose, student, onSuccess }) {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [step, setStep] = useState('camera');
  // camera | preview | saving | done | error
  const [message, setMessage] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  const resetModal = () => {
    setCapturedImage(null);
    setStep('camera');
    setMessage('');
    setCameraReady(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // ✅ Photo capture
  const capture = () => {
    const img = webcamRef.current?.getScreenshot();
    if (img) {
      setCapturedImage(img);
      setStep('preview');
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setStep('camera');
  };

  // ✅ Face register API call
  const saveFace = async () => {
    setStep('saving');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/face/register',
        {
          studentId: student.id,
          image: capturedImage
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        }
      );
      setMessage(res.data.message || 'Face registered!');
      setStep('done');
      if (onSuccess) onSuccess(student.id);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed!';
      setMessage(errMsg);
      setStep('error');
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <MdFaceRetouchingNatural className="w-5 h-5 text-blue-500"/>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Register Face</h2>
              <p className="text-xs text-gray-400">
                {student?.name} — {student?.studentId}
              </p>
            </div>
          </div>
          <button onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-all">
            <MdClose className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* ===== CAMERA STEP ===== */}
          {step === 'camera' && (
            <>
              <div className="relative rounded-2xl overflow-hidden bg-gray-900">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.9}
                  className="w-full rounded-2xl"
                  onUserMedia={() => setCameraReady(true)}
                  onUserMediaError={() => {
                    setMessage('Camera access denied!');
                    setStep('error');
                  }}
                  videoConstraints={{ facingMode: 'user', width: 480, height: 360 }}
                />

                {/* Face guide frame */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-44 h-52">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-blue-400 rounded-tl-xl"
                      style={{ borderWidth: '3px' }}/>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-blue-400 rounded-tr-xl"
                      style={{ borderWidth: '3px' }}/>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-blue-400 rounded-bl-xl"
                      style={{ borderWidth: '3px' }}/>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-blue-400 rounded-br-xl"
                      style={{ borderWidth: '3px' }}/>
                    {/* Scan line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-blue-400/60 animate-bounce"
                      style={{ top: '50%' }}/>
                  </div>
                </div>

                {/* Status */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium
                    ${cameraReady ? 'bg-green-500/80 text-white' : 'bg-black/50 text-gray-300'}`}>
                    {cameraReady ? 'Camera Ready ✓' : 'Starting camera...'}
                  </span>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-blue-700 font-semibold mb-2 flex items-center gap-1">
                  <MdWarning className="w-3.5 h-3.5"/>
                  Tips for best results:
                </p>
                <div className="grid grid-cols-2 gap-1 text-xs text-blue-600">
                  <span>✓ Good lighting</span>
                  <span>✓ Look at camera</span>
                  <span>✓ No glasses/mask</span>
                  <span>✓ Neutral expression</span>
                </div>
              </div>

              <button
                onClick={capture}
                disabled={!cameraReady}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                <MdCameraAlt className="w-5 h-5"/>
                Capture Photo
              </button>
            </>
          )}

          {/* ===== PREVIEW STEP ===== */}
          {step === 'preview' && capturedImage && (
            <>
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full rounded-2xl border-4 border-blue-200"/>
                <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  Preview
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-sm text-gray-600">
                  Is this a clear photo of
                  <span className="font-semibold text-gray-800"> {student?.name}</span>?
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Make sure the face is clearly visible
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={retake}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm">
                  <MdRefresh className="w-4 h-4"/> Retake
                </button>
                <button onClick={saveFace}
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium">
                  <MdCheck className="w-4 h-4"/> Register Face
                </button>
              </div>
            </>
          )}

          {/* ===== SAVING STEP ===== */}
          {step === 'saving' && (
            <div className="text-center py-10 space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MdFaceRetouchingNatural className="w-8 h-8 text-blue-400"/>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Processing Face...</p>
                <p className="text-xs text-gray-400 mt-1">
                  Generating face encoding — please wait
                </p>
              </div>
              <div className="flex justify-center gap-1">
                {[0,1,2].map(i => (
                  <div key={i}
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}/>
                ))}
              </div>
            </div>
          )}

          {/* ===== DONE STEP ===== */}
          {step === 'done' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <MdCheckCircle className="w-12 h-12 text-green-500"/>
              </div>
              <div>
                <p className="font-bold text-green-700 text-lg">Face Registered!</p>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {student?.name} can now mark attendance using face recognition
                </p>
              </div>
              <button onClick={handleClose}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                <MdCheck className="w-5 h-5"/> Done
              </button>
            </div>
          )}

          {/* ===== ERROR STEP ===== */}
          {step === 'error' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <MdCancel className="w-12 h-12 text-red-500"/>
              </div>
              <div>
                <p className="font-bold text-red-600 text-lg">Registration Failed!</p>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={retake}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-all text-sm">
                  Try Again
                </button>
                <button onClick={handleClose}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all text-sm">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
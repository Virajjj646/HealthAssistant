
import React, { useState, useRef } from 'react';
import FeatureCard from './components/FeatureCard';
import VoiceButton from './components/VoiceButton';
import { simplifyMedicalText, checkMisinformation, getMedicationGuide } from './services/geminiService';
import { AppFeature, SimplifiedMedicalInfo, MisinfoResult, MedicationGuide, TrustLevel } from './types';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<AppFeature | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setActiveFeature(null);
    setInput('');
    setImagePreview(null);
    setResult(null);
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAction = async () => {
    if (!input && !imagePreview) return;
    setLoading(true);
    try {
      if (activeFeature === 'clarity') {
        const data = await simplifyMedicalText(input, imagePreview || undefined);
        setResult(data);
      } else if (activeFeature === 'misinfo') {
        const data = await checkMisinformation(input);
        setResult(data);
      } else if (activeFeature === 'meds') {
        const data = await getMedicationGuide(input);
        setResult(data);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!activeFeature) {
      return (
        <div className="space-y-6 max-w-4xl mx-auto py-12 px-4">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-black text-slate-800 mb-4">Hello! How can I help you today?</h1>
            <p className="text-2xl text-slate-600">I am your health assistant. Tap one of the big buttons below.</p>
          </header>
          
          <FeatureCard 
            title="Understand Medical Papers" 
            description="Take a photo of your prescription or copy doctor notes to get a simple explanation."
            icon="fa-file-medical"
            colorClass="bg-blue-600 border-blue-800"
            onClick={() => setActiveFeature('clarity')}
          />
          <FeatureCard 
            title="Check Health News" 
            description="Is a news story or a text message safe? I'll check it for you."
            icon="fa-shield-heart"
            colorClass="bg-teal-600 border-teal-800"
            onClick={() => setActiveFeature('misinfo')}
          />
          <FeatureCard 
            title="Medication Help" 
            description="Find out how to take your medicine safely and why it's used."
            icon="fa-pills"
            colorClass="bg-indigo-600 border-indigo-800"
            onClick={() => setActiveFeature('meds')}
          />
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button 
          onClick={reset}
          className="mb-8 text-xl font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> Go Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-slate-800">
            {activeFeature === 'clarity' && "What does the medical paper say?"}
            {activeFeature === 'misinfo' && "What health claim did you hear?"}
            {activeFeature === 'meds' && "What is the name of your medicine?"}
          </h2>

          {activeFeature === 'clarity' && (
            <div className="mb-8">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              {!imagePreview ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center p-12 border-4 border-dashed border-blue-200 rounded-3xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all mb-6"
                >
                  <i className="fas fa-camera text-6xl mb-4"></i>
                  <span className="text-2xl font-bold">Tap to add a photo of your prescription</span>
                </button>
              ) : (
                <div className="relative mb-6">
                  <img 
                    src={imagePreview} 
                    alt="Prescription preview" 
                    className="w-full max-h-96 object-contain rounded-2xl border-4 border-blue-500"
                  />
                  <button 
                    onClick={removeImage}
                    className="absolute top-4 right-4 bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 active:scale-95"
                  >
                    <i className="fas fa-times text-2xl"></i>
                  </button>
                </div>
              )}
              <p className="text-xl text-slate-500 text-center mb-6">Or type the notes below:</p>
            </div>
          )}
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeFeature === 'meds' ? "Example: Aspirin" : "Type or paste here..."}
            className="w-full h-48 p-6 text-2xl border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-all mb-6"
          />

          <button
            onClick={handleAction}
            disabled={loading || (!input && !imagePreview)}
            className={`w-full py-6 rounded-2xl text-2xl font-bold text-white shadow-lg transition-all ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {loading ? <i className="fas fa-spinner fa-spin mr-3"></i> : <i className="fas fa-search mr-3"></i>}
            {loading ? 'Checking for you...' : 'Explain it to me'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-in fade-in duration-500">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl font-black text-slate-800">Here is the simple version:</h3>
              <VoiceButton text={
                activeFeature === 'clarity' ? `${result.whatIsIt}. ${result.howToUse}. ${result.whyImportant}. Please confirm this with your doctor.` :
                activeFeature === 'misinfo' ? `This claim is ${result.trustLevel}. ${result.explanation}. The trick used is ${result.trickUsed}. Please confirm this with your doctor.` :
                `${result.name}. ${result.dosage}. ${result.precautions}. ${result.reminder}. Please confirm this with your doctor.`
              } />
            </div>

            <div className="space-y-8 text-2xl text-slate-700 leading-relaxed">
              {activeFeature === 'clarity' && (
                <>
                  <div>
                    <strong className="text-blue-600 block mb-2">What is it?</strong>
                    <p>{(result as SimplifiedMedicalInfo).whatIsIt}</p>
                  </div>
                  <div>
                    <strong className="text-blue-600 block mb-2">How do I use it?</strong>
                    <p>{(result as SimplifiedMedicalInfo).howToUse}</p>
                  </div>
                  <div>
                    <strong className="text-blue-600 block mb-2">Why is it important?</strong>
                    <p>{(result as SimplifiedMedicalInfo).whyImportant}</p>
                  </div>
                </>
              )}

              {activeFeature === 'misinfo' && (
                <>
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50 border-l-8 border-slate-300">
                    <span className="text-lg font-bold uppercase text-slate-500">Trust Level</span>
                    <span className={`text-4xl font-black ${
                      (result as MisinfoResult).trustLevel === TrustLevel.SAFE ? 'text-green-600' :
                      (result as MisinfoResult).trustLevel === TrustLevel.CAUTION ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(result as MisinfoResult).trustLevel}
                    </span>
                  </div>
                  <div>
                    <strong className="text-teal-600 block mb-2">Explanation</strong>
                    <p>{(result as MisinfoResult).explanation}</p>
                  </div>
                  <div>
                    <strong className="text-teal-600 block mb-2">The Trick Being Used</strong>
                    <p>{(result as MisinfoResult).trickUsed}</p>
                  </div>
                </>
              )}

              {activeFeature === 'meds' && (
                <>
                  <div className="p-6 bg-indigo-50 rounded-2xl border-l-8 border-indigo-500">
                    <h4 className="text-4xl font-black text-indigo-900">{(result as MedicationGuide).name}</h4>
                  </div>
                  <div>
                    <strong className="text-indigo-600 block mb-2">How to take it</strong>
                    <p>{(result as MedicationGuide).dosage}</p>
                  </div>
                  <div>
                    <strong className="text-indigo-600 block mb-2">Be Careful</strong>
                    <p>{(result as MedicationGuide).precautions}</p>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
                    <strong className="text-yellow-700 block mb-2"><i className="fas fa-bell mr-2"></i> Daily Reminder</strong>
                    <p>{(result as MedicationGuide).reminder}</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-12 p-6 bg-red-50 text-red-800 rounded-2xl border border-red-100 font-bold italic text-center text-xl">
              "Please confirm this information with your doctor."
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24">
      {renderContent()}
      
      {/* Sticky footer for support */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200 flex justify-center shadow-2xl">
        <div className="flex gap-4 items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xl font-medium text-slate-600">Assistant is ready to help</span>
        </div>
      </div>
    </div>
  );
};

export default App;

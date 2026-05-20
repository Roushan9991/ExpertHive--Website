import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { saveExpertToSheet } from '../api/sheetsApi';
import { EXPERT_APPLICATION_FIELDS, saveExpertApplication, findUserByEmail } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export const ApplyExpert = () => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState(
    EXPERT_APPLICATION_FIELDS.reduce((acc, field) => {
      acc[field.name] = field.default || (field.type === 'multiselect' ? [] : '');
      return acc;
    }, {})
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;

    if (type === 'file' && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          [name]: e.target.result,
        }));
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(files[0]);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSlotChange = (slot, checked) => {
    setFormData((prev) => ({
      ...prev,
      availableSlots: checked
        ? [...prev.availableSlots, slot]
        : prev.availableSlots.filter((s) => s !== slot),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.expertEmail.trim().toLowerCase();
    const password = formData.expertPassword.trim();

    if (!email || !password) {
      toast.error('Email and password are required for your expert login.');
      return;
    }

    setSubmitting(true);

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      if (existingUser.role === 'expert') {
        toast.error('This email is already registered as an expert. Please login with your expert credentials.');
      } else {
        toast.error('This email is already registered. Please login or use another email.');
      }
      setSubmitting(false);
      return;
    }

    const signupSuccess = await signup(formData.name, email, password, 'expert');
    if (!signupSuccess) {
      setSubmitting(false);
      return;
    }

    const application = {
      ...formData,
      expertEmail: email,
      fee: Number(formData.fee || 0),
      imageFile: formData.imageFile,
    };

    await saveExpertApplication(application);
    // saveExpertToSheet(application);
    setSubmitted(true);
    setSubmitting(false);
    toast.success('Thanks for applying! Your profile is now pending admin approval.');
  };

  if (submitted) {
    return (
      <main className="flex-grow pt-16 bg-surface px-lg py-xl min-h-screen">
        <div className="max-w-container-max mx-auto bg-surface-container-lowest border border-outline-variant rounded-3xl p-xl shadow-sm text-center">
          <h1 className="font-h1 text-h1 text-on-surface">Thank you for applying</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-4">
            Your expert application has been received. An admin will review your request shortly.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            If approved, your profile will appear in the Find Experts section and you can login with the credentials you provided.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/" className="font-label-md text-label-md bg-primary text-on-primary px-6 py-3 rounded-xl">Return Home</Link>
            <Link to="/login" className="font-label-md text-label-md bg-secondary-container text-on-secondary-container px-6 py-3 rounded-xl">Login</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow pt-16 bg-surface px-lg py-xl">
      <div className="max-w-container-max mx-auto bg-surface-container-lowest border border-outline-variant rounded-3xl p-xl shadow-sm">
        <div className="mb-8">
          <h1 className="font-h1 text-h1 text-on-surface">Apply to Become an Expert</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Fill in the form below to request expert approval. Once approved by admin, your profile will appear on the Find Experts page.
          </p>
        </div>

        <form className="grid grid-cols-1 lg:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {EXPERT_APPLICATION_FIELDS.map((field) => (
            <label key={field.name} className="flex flex-col gap-2 text-on-surface">
              <span className="font-label-md text-label-md">{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="min-h-[140px] rounded-2xl border border-outline-variant bg-surface p-4 text-body-md text-on-surface transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : field.type === 'file' ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    name={field.name}
                    onChange={handleChange}
                    accept={field.accept}
                    required={field.required}
                    className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface transition-shadow focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-on-primary file:transition-colors file:hover:bg-primary-container"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover border border-outline-variant"
                    />
                  )}
                </div>
              ) : field.type === 'multiselect' ? (
                <div className="rounded-2xl border border-outline-variant bg-surface p-4 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {field.options.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-body-md">
                        <input
                          type="checkbox"
                          checked={formData[field.name].includes(option.value)}
                          onChange={(e) => handleSlotChange(option.value, e.target.checked)}
                          className="rounded border-outline-variant text-primary focus:ring-primary"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </label>
          ))}

          <div className="lg:col-span-2 flex flex-col gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-primary px-6 py-4 text-label-md font-semibold text-on-primary transition hover:bg-primary-container disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Already want to view the expert booking list? <Link to="/experts" className="text-primary underline">Go to booking page</Link>.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};

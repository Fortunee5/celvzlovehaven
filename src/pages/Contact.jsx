import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-6">Contact Us</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Your Name" required
              className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input type="email" placeholder="Your Email" required
              className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <textarea placeholder="Your Message" rows="5" required
              className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
            <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition font-semibold">
              Send Message
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <Phone className="text-teal-600 mt-1" />
              <div><p className="font-semibold">Phone</p><p className="text-gray-600">+1 234 567 8900</p></div>
            </div>
            <div className="flex items-start gap-4 mb-4">
              <Mail className="text-teal-600 mt-1" />
              <div><p className="font-semibold">Email</p><p className="text-gray-600">info@pastorchris.org</p></div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="text-teal-600 mt-1" />
              <div><p className="font-semibold">Address</p><p className="text-gray-600">123 Ministry Lane, Faith City</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
import { useState } from 'react';
import { Headset, Send, Mail, Phone, Clock, CheckCircle2 } from 'lucide-react';
import TopBar from '../components/TopBar';
import '../styles/Support.css';

const Support = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'general',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here is where you would normally hook up an API to send the email!
    setIsSubmitted(true);
  };

  return (
    <>
      <TopBar title="SUPPORT CENTER" icon={<Headset className="header-icon" />} />
      <div className="page-content">
        
        {/* HEADER */}
        <div className="support-header-container">
          <div className="support-subtitle">We are here to help</div>
          <h1 className="support-title">
            How can we <span className="text-gold">support</span> your journey?
          </h1>
          <p className="support-desc">
            Whether you have a question about a specific simulation, need help updating your financial snapshot, or want to speak to an advisor, our team is ready to assist.
          </p>
        </div>

        {/* SPLIT LAYOUT */}
        <div className="support-layout">
          
          {/* LEFT COLUMN: THE FORM */}
          <div className="support-card">
            {isSubmitted ? (
              // Success State
              <div className="success-message-container">
                <CheckCircle2 className="success-icon-large" />
                <h2 className="success-title">Message Sent Successfully!</h2>
                <p className="success-text">
                  Thank you for reaching out, {formData.firstName}. A member of the NextGen Wealth Studio team will review your inquiry and get back to you within 24 hours.
                </p>
                <button className="reset-btn" onClick={() => setIsSubmitted(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              // Active Form State
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group-half">
                    <label className="form-label" htmlFor="firstName">First Name</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName" 
                      className="form-input" 
                      placeholder="Themba"
                      value={formData.firstName}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="form-group-half">
                    <label className="form-label" htmlFor="lastName">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName" 
                      className="form-input" 
                      placeholder="Dlamini"
                      value={formData.lastName}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="form-input" 
                    placeholder="themba.dlamini@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="subject">What do you need help with?</label>
                  <select 
                    id="subject" 
                    name="subject" 
                    className="form-select"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="simulation">Help with the Simulation Lab</option>
                    <option value="strategy">Question about Strategy Tracks</option>
                    <option value="technical">Technical Bug / Issue</option>
                    <option value="advisor">Connect with an Advisor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="message">Your Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    className="form-textarea" 
                    placeholder="Please describe how we can help you..."
                    value={formData.message}
                    onChange={handleChange}
                    required 
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  <Send size={18} /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* RIGHT OLUMN: QUICK CONTACT SIDEBAR */}
          <div className="contact-sidebar">
            <div className="contact-info-card">
              
              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <Mail className="contact-icon" />
                </div>
                <div className="contact-text">
                  <h4>Email Support</h4>
                  <p>support@nextgenwealth.co.za<br/>Average response: 2 hours</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <Phone className="contact-icon" />
                </div>
                <div className="contact-text">
                  <h4>Call the Studio</h4>
                  <p>0860 111 222<br/>Toll-free within South Africa</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <Clock className="contact-icon" />
                </div>
                <div className="contact-text">
                  <h4>Operating Hours</h4>
                  <p>Monday - Friday<br/>08:00 AM - 17:00 PM (SAST)</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Support;
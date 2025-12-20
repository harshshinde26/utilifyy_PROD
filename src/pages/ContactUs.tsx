import React, { useState } from 'react';

const ContactUs: React.FC = () => {
    const [contactMessage, setContactMessage] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSendMail = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent("Feedback for utilifyy");
        const bodyText = userEmail 
            ? `Message from: ${userEmail}\n\n${contactMessage}` 
            : contactMessage;
        const body = encodeURIComponent(bodyText);
        window.location.href = `mailto:harshshinde818@gmail.com?subject=${subject}&body=${body}`;
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg shadow-lg p-8">
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Contact Us</h1>
                
                <div className="space-y-6 text-gray-700 dark:text-text-primary leading-relaxed mb-8">
                    <p className="text-lg">
                        We'd love to hear from you! Whether it's feedback, a bug report, or a new tool suggestion — 
                        your input helps us make Utilifyy better.
                    </p>
                </div>

                <div className="mb-8">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email Us</h3>
                            <a 
                                href="mailto:harshshinde818@gmail.com" 
                                className="text-accent hover:underline"
                            >
                                harshshinde818@gmail.com
                            </a>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Response Time</h3>
                            <p className="text-gray-600 dark:text-text-secondary">
                                We typically respond within 24-48 hours
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-border pt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Send Us a Message</h2>
                    <form onSubmit={handleSendMail} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">
                                Your Email (Optional)
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="w-full bg-white dark:bg-secondary border border-gray-300 dark:border-border rounded-md px-4 py-2.5 text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                                placeholder="your.email@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">
                                Your Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                className="w-full h-32 bg-white dark:bg-secondary border border-gray-300 dark:border-border rounded-md p-3 text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none"
                                placeholder="Tell us what's on your mind..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                        >
                            {isSubmitted ? 'Opening Email Client...' : 'Send Message'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 p-4 bg-accent/10 dark:bg-accent/20 rounded-lg border border-accent/20">
                    <p className="text-sm text-gray-600 dark:text-text-secondary">
                        <strong>Note:</strong> Clicking "Send Message" will open your default email client with a pre-filled message. 
                        You can review and send it from there.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;


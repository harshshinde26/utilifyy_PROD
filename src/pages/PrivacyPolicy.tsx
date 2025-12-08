import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Privacy Policy</h1>
            <p className="text-sm text-gray-500 dark:text-text-secondary mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            
            <div className="space-y-6 text-gray-700 dark:text-text-primary leading-relaxed">
                <p>
                    Your privacy is important to us. Utilifyy is designed as a <strong className="text-accent">client-side web app</strong>, 
                    which means all calculations, conversions, and actions happen directly in your browser. 
                    We do <strong>not collect, store, or share</strong> any personal data.
                </p>

                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Information Collection</h2>
                    <p>
                        Utilifyy does not require registration or personal details. 
                        No form data, text input, or tool results are transmitted to any server.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cookies and Analytics</h2>
                    <p>
                        We may use <strong>Google AdSense</strong> to display ads. Google may use cookies to personalize ad content 
                        and measure ad performance. You can control or disable ad personalization in your Google account settings.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Third-Party Services</h2>
                    <p>
                        Some tools or ads may link to external websites. Utilifyy is not responsible for their privacy policies. 
                        We encourage you to read their terms before interacting.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Data Storage</h2>
                    <p>
                        Utilifyy may use your browser's local storage to save preferences such as theme settings and currency selection. 
                        This data is stored locally on your device and is never transmitted to our servers.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Contact</h2>
                    <p>
                        For questions about this Privacy Policy, you can reach us at{' '}
                        <a href="mailto:harshshinde818@gmail.com" className="text-accent hover:underline">
                            harshshinde818@gmail.com
                        </a>.
                    </p>
                </section>

                <div className="mt-8 p-4 bg-accent/10 dark:bg-accent/20 rounded-lg border border-accent/20">
                    <p className="text-sm text-gray-600 dark:text-text-secondary">
                        <strong>Your privacy is our priority.</strong> All calculations and data processing are performed entirely in your browser. 
                        No data is sent to external servers.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;



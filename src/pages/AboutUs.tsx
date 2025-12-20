import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">About Utilifyy</h1>
            
            <div className="space-y-6 text-gray-700 dark:text-text-primary leading-relaxed">
                <p className="text-lg">
                    Welcome to <strong className="text-accent">Utilifyy</strong> — your all-in-one free online toolkit built for speed, privacy, and simplicity. 
                    Our goal is to make everyday digital tasks easier, faster, and more accessible — all without requiring logins or downloads.
                </p>

                <p>
                    From calculators and converters to time trackers and text tools, Utilifyy helps you get work done instantly — 
                    all client-side, meaning your data never leaves your browser.
                </p>

                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Why We Built Utilifyy</h2>
                    <p>
                        We noticed that small but important tools — like unit converters, stopwatches, and password generators — 
                        were often hidden behind ads or complex interfaces. So we built Utilifyy: 
                        a single, clean, fast web app for all essential daily utilities.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Our Mission</h2>
                    <p>
                        To provide a collection of lightweight, reliable, and privacy-first tools that anyone can use freely — 
                        anytime, anywhere, on any device.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">What We Offer</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Financial calculators for loan planning and investment</li>
                        <li>Unit converters for everyday measurements</li>
                        <li>Text tools for writing and editing</li>
                        <li>Image tools for photo editing</li>
                        <li>Time management utilities</li>
                        <li>Developer tools for web design</li>
                    </ul>
                </section>

                <div className="mt-8 p-4 bg-accent/10 dark:bg-accent/20 rounded-lg border border-accent/20">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        <strong>Utilifyy</strong> – Simple tools. Super fast. Always free.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;



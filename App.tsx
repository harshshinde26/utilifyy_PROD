import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AllTools } from './components/Toolbox';
import { Tool, Currency } from './types';
import * as Icons from './components/Icons';

const tools: Tool[] = [
    // Time
    { id: 'stopwatch', name: 'Stopwatch', description: 'Measure elapsed time with precision.', category: 'Time', icon: <Icons.StopwatchIcon />, component: AllTools.Stopwatch },
    { id: 'timer', name: 'Timer', description: 'Set a countdown for any task.', category: 'Time', icon: <Icons.TimerIcon />, component: AllTools.Timer },
    { id: 'world_clock', name: 'World Clock', description: 'Check current time in cities worldwide.', category: 'Time', icon: <Icons.GlobeIcon />, component: AllTools.WorldClock },
    { id: 'chess_clock', name: 'Chess Clock', description: 'Dual timer for chess and other games.', category: 'Time', icon: <Icons.ChessKnightIcon />, component: AllTools.ChessClock },
    // Converters
    { id: 'unit_converter', name: 'Unit Converter', description: 'Convert between various units.', category: 'Converters', icon: <Icons.SwitchHorizontalIcon />, component: AllTools.UnitConverter },
    // Health & Lifestyle
    { id: 'bmi_converter', name: 'BMI Calculator', description: 'Calculate your Body Mass Index.', category: 'Health & Lifestyle', icon: <Icons.HeartIcon />, component: AllTools.BMICalculator },
    { id: 'age_calculator', name: 'Age Calculator', description: 'Find your age and next birthday.', category: 'Health & Lifestyle', icon: <Icons.CakeIcon />, component: AllTools.AgeCalculator },
    // Text
    { id: 'word_counter', name: 'Word Counter', description: 'Count words, characters, sentences.', category: 'Text', icon: <Icons.DocumentTextIcon />, component: AllTools.WordCounter },
    { id: 'case_converter', name: 'Case Converter', description: 'Change text to UPPERCASE, etc.', category: 'Text', icon: <Icons.SwitchVerticalIcon />, component: AllTools.CaseConverter },
    { id: 'lorem_ipsum_generator', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text.', category: 'Text', icon: <Icons.ClipboardListIcon />, component: AllTools.LoremIpsumGenerator },
    { id: 'emoji_remover', name: 'Emoji Remover', description: 'Clean text by removing emojis.', category: 'Text', icon: <Icons.SparklesIcon />, component: AllTools.EmojiRemover },
    // Developer
    { id: 'password_generator', name: 'Password Generator', description: 'Create strong, random passwords.', category: 'Developer', icon: <Icons.LockClosedIcon />, component: AllTools.PasswordGenerator },
    { id: 'color_picker', name: 'Color Tools', description: 'Pick colors and get HEX/RGB values.', category: 'Developer', icon: <Icons.ColorSwatchIcon />, component: AllTools.ColorPicker },
    // Calculation
    { id: 'calculator', name: 'Calculator', description: 'Perform basic arithmetic.', category: 'Calculation', icon: <Icons.CalculatorIcon />, component: AllTools.Calculator },
    { id: 'currency_converter', name: 'Currency Converter', description: 'Convert global currencies.', category: 'Calculation', icon: <Icons.CurrencyDollarIcon />, component: AllTools.CurrencyConverter },
    { id: 'tip_calculator', name: 'Tip Calculator', description: 'Calculate tips and split bills.', category: 'Calculation', icon: <Icons.ReceiptTaxIcon />, component: AllTools.TipCalculator },
    { id: 'date_calculator', name: 'Date Calculator', description: 'Calculate duration between dates.', category: 'Calculation', icon: <Icons.CalendarIcon />, component: AllTools.DateCalculator },
    { id: 'emi_calculator', name: 'EMI Calculator', description: 'Calculate your Equated Monthly Installment.', category: 'Calculation', icon: <Icons.PieChartIcon />, component: AllTools.EMICalculator },
    { id: 'profit_loss_calculator', name: 'Profit & Loss Calculator', description: 'Calculate profit or loss from transactions.', category: 'Calculation', icon: <Icons.TrendingUpIcon />, component: AllTools.ProfitLossCalculator },
    { id: 'simple_interest_calculator', name: 'Simple Interest Calculator', description: 'Compute simple interest over time.', category: 'Calculation', icon: <Icons.PercentIcon />, component: AllTools.SimpleInterestCalculator },
    { id: 'sip_calculator', name: 'SIP Calculator', description: 'Estimate returns on your SIP investments.', category: 'Calculation', icon: <Icons.ChartBarIcon />, component: AllTools.SIPCalculator },
    { id: 'compound_interest_calculator', name: 'Compound Interest Calculator', description: 'Calculate compound interest on investments.', category: 'Calculation', icon: <Icons.LibraryIcon />, component: AllTools.CompoundInterestCalculator },
    { id: 'percentage_calculator', name: 'Percentage Calculator', description: 'Solve various percentage problems.', category: 'Calculation', icon: <Icons.CalculatorPercentIcon />, component: AllTools.PercentageCalculator },
    { id: 'discount_calculator', name: 'Discount Calculator', description: 'Calculate final price after discount.', category: 'Calculation', icon: <Icons.TagIcon />, component: AllTools.DiscountCalculator },
    // Image
    { id: 'image_resizer', name: 'Image Resizer & Compressor', description: 'Resize and compress images.', category: 'Image', icon: <Icons.PhotographIcon />, component: AllTools.ImageResizer },
    { id: 'photo_editor', name: 'Photo Editor', description: 'Edit photos with filters, adjustments, and text. Works entirely offline.', category: 'Image', icon: <Icons.PhotographIcon />, component: AllTools.PhotoEditor },
];

const currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'United States Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
];

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`w-full bg-gray-50 dark:bg-secondary border border-gray-300 dark:border-border rounded-lg px-4 py-2.5 text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ${props.className}`} />
);


const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return false;
        }
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [query]);

    return matches;
};


const App: React.FC = () => {
    const [activeToolId, setActiveToolId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
        try {
            const stored = localStorage.getItem('currency');
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse currency from localStorage", e);
        }
        return currencies[0];
    });

    // Hash-based routing and SEO title/meta updates
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '');
            const toolExists = tools.some(tool => tool.id === hash);
            setActiveToolId(toolExists ? hash : null);
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial check on page load
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const activeTool = useMemo(() => tools.find(tool => tool.id === activeToolId), [activeToolId]);

    useEffect(() => {
        const metaDescriptionTag = document.querySelector('meta[name="description"]');
        if (activeTool) {
            document.title = `${activeTool.name} | utilifyy`;
            if (metaDescriptionTag) {
                metaDescriptionTag.setAttribute('content', `${activeTool.description} Use this free online tool on utilifyy.`);
            }
        } else {
            document.title = 'utilifyy';
             if (metaDescriptionTag) {
                metaDescriptionTag.setAttribute('content', 'A comprehensive, client-side web application offering a suite of free utility tools including converters, time tools, text manipulators, and calculators.');
            }
        }
    }, [activeTool]);


    useEffect(() => {
        localStorage.setItem('currency', JSON.stringify(selectedCurrency));
    }, [selectedCurrency]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const currency = currencies.find(c => c.code === e.target.value);
        if (currency) {
            setSelectedCurrency(currency);
        }
    };

    const groupedTools = useMemo(() => {
        // FIX: Explicitly setting the generic type for `reduce` to `Record<string, Tool[]>` ensures correct type inference for the accumulator. This resolves an issue where `groupedTools` was being incorrectly typed, leading to a downstream error on a `.map` call where `toolList` was inferred as `unknown`. The original error was reported for line 208, but the root cause was in this `reduce` block.
        return tools.reduce<Record<string, Tool[]>>((acc, tool) => {
            const category = tool.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(tool);
            return acc;
        }, {});
    }, []);

    const handleToolSelect = (id: string) => {
        window.location.hash = `#/${id}`;
        setIsSidebarOpen(false);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <nav className="p-4 space-y-4 flex-1">
                {Object.entries(groupedTools).map(([category, toolList]) => (
                    <div key={category}>
                        <h3 className="px-2 text-sm font-semibold text-gray-500 dark:text-text-secondary tracking-wider uppercase">{category}</h3>
                        <div className="mt-2 space-y-1">
                            {toolList.map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => handleToolSelect(tool.id)}
                                    className={`w-full flex items-start text-left px-3 py-2 rounded-md transition-colors duration-150 ${
                                        activeToolId === tool.id
                                            ? 'bg-accent text-white'
                                            : 'text-gray-700 dark:text-text-primary hover:bg-gray-200 dark:hover:bg-secondary hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <span className="mr-3 w-5 h-5 flex-shrink-0 mt-0.5">{tool.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium">{tool.name}</p>
                                        <p className={`text-xs ${activeToolId === tool.id ? 'text-blue-200' : 'text-gray-500 dark:text-text-secondary'} mt-0.5`}>{tool.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-border">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 text-gray-700 dark:text-text-primary hover:bg-gray-200 dark:hover:bg-secondary hover:text-gray-900 dark:hover:text-white"
                >
                    <span className="mr-3 w-5 h-5">{theme === 'light' ? <Icons.MoonIcon /> : <Icons.SunIcon />}</span>
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
                 <div className="mt-2">
                    <label htmlFor="currency-select" className="px-3 text-xs font-medium text-gray-500 dark:text-text-secondary tracking-wider uppercase">Currency</label>
                    <Select
                        id="currency-select"
                        value={selectedCurrency.code}
                        onChange={handleCurrencyChange}
                        className="mt-1"
                    >
                        {currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                    </Select>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-primary">
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-40 flex md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="w-64 bg-white dark:bg-primary border-r border-gray-200 dark:border-border h-full overflow-y-auto">
                    <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-border">
                        <button 
                            onClick={() => window.location.hash = '#/'} 
                            aria-label="Go to homepage"
                        >
                            <h1 className="font-logo text-3xl text-gray-900 dark:text-white">utilifyy</h1>
                        </button>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-white">
                            <Icons.XIcon />
                        </button>
                    </div>
                    {isSidebarOpen && <SidebarContent />}
                </div>
                <div className="flex-1 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-64 border-r border-gray-200 dark:border-border bg-white dark:bg-primary flex-shrink-0">
                <div className="h-16 border-b border-gray-200 dark:border-border flex-shrink-0">
                    {/* This space is intentionally left blank as the logo has been moved to the main header. */}
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isDesktop && <SidebarContent />}
                </div>
            </aside>
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="relative flex items-center justify-between h-16 px-4 bg-white dark:bg-primary border-b border-gray-200 dark:border-border flex-shrink-0">
                    <div className="absolute left-4 md:hidden">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 dark:text-text-secondary hover:text-gray-900 dark:hover:text-white">
                            <Icons.MenuIcon />
                        </button>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <button 
                            onClick={() => window.location.hash = '#/'} 
                            aria-label="Go to homepage"
                            className="p-1 -m-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-primary focus:ring-accent"
                        >
                            <h1 className="font-logo text-3xl text-gray-900 dark:text-white transition-opacity hover:opacity-80">utilifyy</h1>
                        </button>
                    </div>
                     {/* Theme toggle removed from header, now only in sidebar */}
                </header>
                
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-secondary dark:to-primary">
                    <div className="max-w-4xl mx-auto">
                         {activeTool ? (
                            <>
                                <header className="mb-8 text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{activeTool.name}</h2>
                                    <p className="mt-1 text-lg text-gray-500 dark:text-text-secondary">{activeTool.description}</p>
                                </header>
                                <activeTool.component selectedCurrency={selectedCurrency} />
                            </>
                        ) : (
                            <AllTools.LandingPage />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;

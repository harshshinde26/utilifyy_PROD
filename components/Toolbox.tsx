import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useStopwatch, useTimer } from '../hooks/useTime';
import * as Icons from './Icons';
import { ToolProps, Currency } from '../types';

const defaultCurrency: Currency = { code: 'USD', symbol: '$', name: 'United States Dollar' };

// --- Helper Components ---
const ToolCard: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {title && <h3 className="text-xl font-bold text-gray-800 dark:text-text-primary px-6 py-5 border-b border-gray-200 dark:border-border bg-gradient-to-r from-accent/5 to-transparent">{title}</h3>}
        <div className="p-6 md:p-8">{children}</div>
    </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'calculator' }> = ({ children, className, variant = 'primary', ...props }) => {
    const baseClasses = 'rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-primary disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]';
    const variantClasses = {
        primary: 'px-6 py-3 bg-accent text-white hover:bg-accent-hover shadow-md hover:shadow-lg',
        secondary: 'px-6 py-3 bg-white dark:bg-secondary border border-gray-300 dark:border-border text-gray-700 dark:text-text-primary hover:bg-gray-100 dark:hover:bg-border shadow-sm hover:shadow-md',
        calculator: 'aspect-square text-2xl bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-border rounded-lg shadow-sm hover:shadow-md'
    };
    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`w-full bg-gray-50 dark:bg-secondary border border-gray-300 dark:border-border rounded-lg px-4 py-2.5 text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ${props.className}`} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`w-full bg-gray-50 dark:bg-secondary border border-gray-300 dark:border-border rounded-lg px-4 py-2.5 text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ${props.className}`} />
);

const formatTime = (timeInMs: number) => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const milliseconds = String(Math.floor((timeInMs % 1000) / 10)).padStart(2, '0');
    return { hours, minutes, seconds, milliseconds };
};


// --- Tool Implementations ---

// 1. Stopwatch
const Stopwatch: React.FC<ToolProps> = () => {
    const { time, isRunning, laps, start, stop, reset, lap } = useStopwatch();
    const { hours, minutes, seconds, milliseconds } = formatTime(time);

    return (
        <ToolCard title="Stopwatch">
            <div className="text-center">
                <div className="font-mono text-6xl md:text-8xl tracking-tight text-gray-900 dark:text-white mb-6">
                    <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
                    <span className="text-4xl md:text-6xl text-gray-500 dark:text-text-secondary">.{milliseconds}</span>
                </div>
                <div className="flex justify-center gap-4 mb-6">
                    <Button onClick={isRunning ? stop : start} className="w-24">
                        {isRunning ? 'Stop' : 'Start'}
                    </Button>
                    <Button onClick={lap} variant="secondary" disabled={!isRunning}>
                        Lap
                    </Button>
                    <Button onClick={reset} variant="secondary">
                        Reset
                    </Button>
                </div>
                {laps.length > 0 && (
                     <div className="max-h-60 overflow-y-auto mt-4 border border-gray-200 dark:border-border rounded-md p-2 text-left">
                        <ul className="divide-y divide-gray-200 dark:divide-border">
                            {laps.slice().reverse().map((lapTime, index) => {
                                const {hours, minutes, seconds, milliseconds} = formatTime(lapTime);
                                return (
                                <li key={index} className="p-2 flex justify-between font-mono text-gray-600 dark:text-text-secondary">
                                    <span>Lap {laps.length - index}</span>
                                    <span>{hours}:{minutes}:{seconds}.{milliseconds}</span>
                                </li>
                                )}
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </ToolCard>
    );
};

// 2. Timer
const Timer: React.FC<ToolProps> = () => {
    const [h, setH] = useState(0);
    const [m, setM] = useState(5);
    const [s, setS] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const totalSeconds = useMemo(() => h * 3600 + m * 60 + s, [h, m, s]);
    const { timeLeft, isRunning, start, pause, reset } = useTimer(totalSeconds);

    const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

    useEffect(() => {
        if (timeLeft === 0 && !isRunning && totalSeconds > 0) {
           audioRef.current?.play().catch(e => console.error("Audio playback failed", e));
        }
    }, [timeLeft, isRunning, totalSeconds]);
    
    return (
        <ToolCard title="Timer">
            <div className="text-center">
                <div className="flex justify-center gap-4 mb-6">
                    <div className="flex flex-col items-center">
                        <label className="text-sm text-gray-500 dark:text-text-secondary mb-1">Hours</label>
                        <Input type="number" value={h} onChange={e => setH(Math.max(0, parseInt(e.target.value) || 0))} className="w-20 text-center" disabled={isRunning} />
                    </div>
                     <div className="flex flex-col items-center">
                        <label className="text-sm text-gray-500 dark:text-text-secondary mb-1">Minutes</label>
                        <Input type="number" value={m} onChange={e => setM(Math.max(0, parseInt(e.target.value) || 0))} className="w-20 text-center" disabled={isRunning} />
                    </div>
                     <div className="flex flex-col items-center">
                        <label className="text-sm text-gray-500 dark:text-text-secondary mb-1">Seconds</label>
                        <Input type="number" value={s} onChange={e => setS(Math.max(0, parseInt(e.target.value) || 0))} className="w-20 text-center" disabled={isRunning} />
                    </div>
                </div>
                 <div className="font-mono text-6xl md:text-8xl tracking-tight text-gray-900 dark:text-white mb-6">
                    <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
                </div>
                <div className="flex justify-center gap-4">
                     <Button onClick={isRunning ? pause : start} className="w-24">
                        {isRunning ? 'Pause' : 'Start'}
                    </Button>
                    <Button onClick={reset} variant="secondary">
                        Reset
                    </Button>
                </div>
                <audio ref={audioRef} src="/sounds/alarm_clock.ogg" preload="auto" />
            </div>
        </ToolCard>
    );
};

// 3. World Clock
const WorldClock: React.FC<ToolProps> = () => {
    // FIX: Cast `Intl` to `any` to bypass a TypeScript error due to missing type definitions for the `supportedValuesOf` method.
    const timezones = useMemo(() => (Intl as any).supportedValuesOf('timeZone'), []);
    const [selectedTimezones, setSelectedTimezones] = useState<string[]>(['Europe/London', 'America/New_York', 'Asia/Tokyo']);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const addTimezone = (tz: string) => {
        if (tz && !selectedTimezones.includes(tz)) {
            setSelectedTimezones([...selectedTimezones, tz]);
        }
    };
    
    return (
        <ToolCard title="World Clock">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <Select onChange={e => addTimezone(e.target.value)} defaultValue="">
                        <option value="" disabled>Add a timezone...</option>
                        {timezones.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
                    </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTimezones.map(tz => (
                        <div key={tz} className="bg-gray-100 dark:bg-secondary p-4 rounded-lg border border-gray-200 dark:border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{tz.split('/').pop()?.replace(/_/g, ' ')}</h4>
                                    <p className="text-sm text-gray-500 dark:text-text-secondary">{tz.split('/')[0].replace(/_/g, ' ')}</p>
                                </div>
                                <button onClick={() => setSelectedTimezones(selectedTimezones.filter(t => t !== tz))} className="text-gray-500 dark:text-text-secondary hover:text-red-500">&times;</button>
                            </div>
                            <p className="text-4xl font-mono text-right mt-2 text-accent">
                                {currentTime.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-sm text-right text-gray-500 dark:text-text-secondary">{currentTime.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>
                    ))}
                </div>
            </div>
        </ToolCard>
    );
};

const ChessClock: React.FC<ToolProps> = () => {
    const [settings, setSettings] = useState({ minutes: 5, increment: 0 });
    const [p1Time, setP1Time] = useState(settings.minutes * 60 * 1000);
    const [p2Time, setP2Time] = useState(settings.minutes * 60 * 1000);
    const [activePlayer, setActivePlayer] = useState<1 | 2 | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const formatClockTime = (ms: number) => {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    
    const stopClock = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!isRunning || activePlayer === null) {
            stopClock();
            return;
        }
        
        intervalRef.current = setInterval(() => {
            if (activePlayer === 1) {
                setP1Time(prev => {
                    if (prev <= 100) { stopClock(); setIsRunning(false); return 0; }
                    return prev - 100;
                });
            } else {
                setP2Time(prev => {
                    if (prev <= 100) { stopClock(); setIsRunning(false); return 0; }
                    return prev - 100;
                });
            }
        }, 100);

        return () => stopClock();
    }, [isRunning, activePlayer, stopClock]);
    
    const handleReset = useCallback(() => {
        setIsRunning(false);
        setActivePlayer(null);
        setP1Time(settings.minutes * 60 * 1000);
        setP2Time(settings.minutes * 60 * 1000);
    }, [settings]);

    const handleStartPause = () => {
        if (p1Time === 0 || p2Time === 0) return;
        setIsRunning(prev => !prev);
        if (!isRunning && activePlayer === null) {
            setActivePlayer(1);
        }
    };
    
    const switchTurn = (fromPlayer: 1 | 2) => {
        if (!isRunning || activePlayer !== fromPlayer) return;
        if (fromPlayer === 1) {
            setP1Time(prev => prev + settings.increment * 1000);
            setActivePlayer(2);
        } else {
            setP2Time(prev => prev + settings.increment * 1000);
            setActivePlayer(1);
        }
    };

    return (
        <ToolCard title="Chess Clock">
            <div className="flex flex-col items-center gap-4">
                {/* Player 2 Timer (Top) */}
                <button
                    onClick={() => switchTurn(2)}
                    className={`w-full p-8 rounded-lg text-center transition-colors duration-200 transform rotate-180 ${activePlayer === 2 ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-secondary'}`}
                    disabled={!isRunning || p1Time === 0 || p2Time === 0}
                >
                    <span className="font-mono text-6xl md:text-8xl">{formatClockTime(p2Time)}</span>
                </button>

                {/* Controls */}
                <div className="flex items-center gap-4 my-4">
                    <Button onClick={handleStartPause} className="w-24">
                        {isRunning ? 'Pause' : 'Start'}
                    </Button>
                    <Button onClick={handleReset} variant="secondary">
                        Reset
                    </Button>
                </div>
                 {/* Settings */}
                {!isRunning && (
                    <div className="flex gap-4 items-center p-4 bg-gray-100 dark:bg-secondary rounded-lg w-full">
                        <div className="flex-1">
                             <label className="text-sm">Minutes</label>
                            <Input type="number" value={settings.minutes} onChange={e => setSettings(s => ({...s, minutes: +e.target.value}))} />
                        </div>
                         <div className="flex-1">
                             <label className="text-sm">Increment (s)</label>
                            <Input type="number" value={settings.increment} onChange={e => setSettings(s => ({...s, increment: +e.target.value}))} />
                        </div>
                        <Button onClick={handleReset} variant="secondary" className="self-end">Apply</Button>
                    </div>
                )}

                {/* Player 1 Timer (Bottom) */}
                 <button
                    onClick={() => switchTurn(1)}
                    className={`w-full p-8 rounded-lg text-center transition-colors duration-200 ${activePlayer === 1 ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-secondary'}`}
                    disabled={!isRunning || p1Time === 0 || p2Time === 0}
                >
                    <span className="font-mono text-6xl md:text-8xl">{formatClockTime(p1Time)}</span>
                </button>
            </div>
        </ToolCard>
    );
};

const conversionConfig = {
    Length: {
        baseUnit: 'Meter',
        units: { 'Meter': 1, 'Kilometer': 1000, 'Centimeter': 0.01, 'Millimeter': 0.001, 'Mile': 1609.34, 'Yard': 0.9144, 'Foot': 0.3048, 'Inch': 0.0254 }
    },
    Weight: {
        baseUnit: 'Kilogram',
        units: { 'Kilogram': 1, 'Gram': 0.001, 'Milligram': 1e-6, 'Pound': 0.453592, 'Ounce': 0.0283495, 'Tonne': 1000 }
    },
    Temperature: {},
    Volume: {
        baseUnit: 'Liter',
        units: { 'Liter': 1, 'Milliliter': 0.001, 'Cubic Meter': 1000, 'Gallon (US)': 3.78541, 'Quart (US)': 0.946353, 'Pint (US)': 0.473176, 'Cup (US)': 0.24 }
    },
    Area: {
        baseUnit: 'Square Meter',
        units: { 'Square Meter': 1, 'Square Kilometer': 1e6, 'Square Mile': 2.59e6, 'Acre': 4046.86, 'Hectare': 10000, 'Square Foot': 0.092903, 'Square Inch': 0.00064516 }
    },
    Speed: {
        baseUnit: 'Meters per Second',
        units: { 'Meters per Second': 1, 'Kilometers per Hour': 0.277778, 'Miles per Hour': 0.44704, 'Feet per Second': 0.3048, 'Knot': 0.514444 }
    },
    Time: {
        baseUnit: 'Second',
        units: { 'Second': 1, 'Minute': 60, 'Hour': 3600, 'Day': 86400, 'Week': 604800, 'Month (avg)': 2.628e6, 'Year (avg)': 3.154e7 }
    },
    'Data Storage': {
        baseUnit: 'Byte',
        units: { 'Byte': 1, 'Kilobyte': 1024, 'Megabyte': 1024 ** 2, 'Gigabyte': 1024 ** 3, 'Terabyte': 1024 ** 4 }
    }
};
const temperatureUnits = ['Celsius', 'Fahrenheit', 'Kelvin'];

const UnitConverter: React.FC<ToolProps> = () => {
    const [category, setCategory] = useState<keyof typeof conversionConfig>('Length');
    const [values, setValues] = useState({ from: '1', to: '' });
    const [units, setUnits] = useState({
        from: Object.keys(conversionConfig.Length.units)[0],
        to: Object.keys(conversionConfig.Length.units)[1]
    });

    const unitOptions = useMemo(() => {
        if (category === 'Temperature') return temperatureUnits;
        return Object.keys(conversionConfig[category as Exclude<keyof typeof conversionConfig, 'Temperature'>].units);
    }, [category]);

    useEffect(() => {
        const newUnits = category === 'Temperature' ? temperatureUnits : Object.keys(conversionConfig[category as Exclude<keyof typeof conversionConfig, 'Temperature'>].units);
        setUnits({ from: newUnits[0], to: newUnits[1] || newUnits[0] });
        setValues({ from: '1', to: '' });
    }, [category]);

    const performConversion = useCallback((amountStr: string, fromUnit: string, toUnit: string) => {
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || fromUnit === toUnit) {
            return amountStr;
        }

        let result: number;
        if (category === 'Temperature') {
            let tempInCelsius: number;
            if (fromUnit === 'Celsius') tempInCelsius = amount;
            else if (fromUnit === 'Fahrenheit') tempInCelsius = (amount - 32) * 5 / 9;
            else tempInCelsius = amount - 273.15;

            if (toUnit === 'Celsius') result = tempInCelsius;
            else if (toUnit === 'Fahrenheit') result = (tempInCelsius * 9 / 5) + 32;
            else result = tempInCelsius + 273.15;
        } else {
            const config = conversionConfig[category as Exclude<keyof typeof conversionConfig, 'Temperature'>];
            const fromUnitToBase = config.units[fromUnit as keyof typeof config.units];
            const toUnitFromBase = config.units[toUnit as keyof typeof config.units];
            const valueInBase = amount * fromUnitToBase;
            result = valueInBase / toUnitFromBase;
        }
        return parseFloat(result.toPrecision(12)).toString();
    }, [category]);

    useEffect(() => {
        const result = performConversion(values.from, units.from, units.to);
        setValues(v => ({...v, to: result}));
    }, [values.from, units.from, units.to, performConversion]);

    const handleValueChange = (direction: 'from' | 'to', value: string) => {
        if (direction === 'from') {
            setValues({ from: value, to: '' });
        } else {
            const newFrom = performConversion(value, units.to, units.from);
            setValues({ from: newFrom, to: value });
        }
    };

    const handleUnitChange = (direction: 'from' | 'to', unit: string) => {
        setUnits(prev => ({...prev, [direction]: unit }));
    };

    const handleSwap = () => {
        setUnits({ from: units.to, to: units.from });
        setValues({ from: values.to, to: values.from });
    };

    return (
        <ToolCard title="Unit Converter">
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Category</label>
                    <Select value={category} onChange={e => setCategory(e.target.value as keyof typeof conversionConfig)}>
                        {Object.keys(conversionConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </Select>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full space-y-2">
                        <Select value={units.from} onChange={e => handleUnitChange('from', e.target.value)}>
                            {unitOptions.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                        </Select>
                        <Input type="number" value={values.from} onChange={e => handleValueChange('from', e.target.value)} />
                    </div>
                    <button onClick={handleSwap} className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-secondary flex-shrink-0 transform md:rotate-0 rotate-90 md:mt-5">
                        <svg className="w-5 h-5 text-gray-600 dark:text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    </button>
                    <div className="w-full space-y-2">
                        <Select value={units.to} onChange={e => handleUnitChange('to', e.target.value)}>
                            {unitOptions.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                        </Select>
                        <Input type="number" value={values.to} onChange={e => handleValueChange('to', e.target.value)} />
                    </div>
                </div>
            </div>
        </ToolCard>
    );
};
const BMICalculator: React.FC<ToolProps> = () => {
    const [height, setHeight] = useState('180');
    const [weight, setWeight] = useState('75');
    const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

    const bmiResult = useMemo(() => {
        const h = parseFloat(height);
        const w = parseFloat(weight);

        if (!h || !w || h <= 0 || w <= 0) return null;

        let bmi;
        if (unit === 'metric') { // height in cm, weight in kg
            bmi = w / ((h / 100) ** 2);
        } else { // height in inches, weight in lbs
            bmi = (w / (h ** 2)) * 703;
        }

        let category, color;
        if (bmi < 18.5) { category = 'Underweight'; color = 'text-blue-400'; }
        else if (bmi < 25) { category = 'Normal weight'; color = 'text-green-400'; }
        else if (bmi < 30) { category = 'Overweight'; color = 'text-yellow-400'; }
        else { category = 'Obesity'; color = 'text-red-400'; }

        return { bmi: bmi.toFixed(1), category, color };
    }, [height, weight, unit]);

    return (
        <ToolCard title="BMI Calculator">
            <div className="space-y-4">
                <div className="flex justify-center">
                    <div className="bg-gray-200 dark:bg-secondary p-1 rounded-lg flex space-x-1">
                        <button onClick={() => setUnit('metric')} className={`px-4 py-1 rounded-md text-sm ${unit === 'metric' ? 'bg-accent text-white' : 'text-gray-600 dark:text-text-secondary'}`}>Metric</button>
                        <button onClick={() => setUnit('imperial')} className={`px-4 py-1 rounded-md text-sm ${unit === 'imperial' ? 'bg-accent text-white' : 'text-gray-600 dark:text-text-secondary'}`}>Imperial</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Height ({unit === 'metric' ? 'cm' : 'in'})</label>
                        <Input type="number" value={height} onChange={e => setHeight(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
                        <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} />
                    </div>
                </div>
                {bmiResult && (
                    <div className="text-center bg-gray-100 dark:bg-secondary p-6 rounded-lg mt-4">
                        <p className="text-gray-500 dark:text-text-secondary text-lg">Your BMI</p>
                        <p className={`text-6xl font-bold ${bmiResult.color}`}>{bmiResult.bmi}</p>
                        <p className={`text-xl font-semibold ${bmiResult.color}`}>{bmiResult.category}</p>
                    </div>
                )}
            </div>
        </ToolCard>
    );
};
const AgeCalculator: React.FC<ToolProps> = () => {
    const [birthDate, setBirthDate] = useState('2000-01-01');

    const ageResult = useMemo(() => {
        const today = new Date();
        const dob = new Date(birthDate);

        if (isNaN(dob.getTime()) || dob > today) return null;

        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        let days = today.getDate() - dob.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        const msUntilBirthday = nextBirthday.getTime() - today.getTime();
        const daysUntilBirthday = Math.ceil(msUntilBirthday / (1000 * 60 * 60 * 24));

        const totalDays = Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
        
        return { years, months, days, daysUntilBirthday, totalDays };
    }, [birthDate]);

    return (
        <ToolCard title="Age Calculator">
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Enter your Date of Birth</label>
                    <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} max={new Date().toISOString().split("T")[0]}/>
                </div>
                {ageResult ? (
                    <div className="space-y-4">
                        <div className="text-center bg-gray-100 dark:bg-secondary p-6 rounded-lg">
                            <p className="text-gray-500 dark:text-text-secondary text-lg">Your Age</p>
                            <p className="text-2xl md:text-4xl font-bold text-accent">
                                {ageResult.years} <span className="text-xl text-gray-700 dark:text-text-primary">years</span>, {ageResult.months} <span className="text-xl text-gray-700 dark:text-text-primary">months</span>, {ageResult.days} <span className="text-xl text-gray-700 dark:text-text-primary">days</span>
                            </p>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-100 dark:bg-secondary p-4 rounded-lg text-center border border-gray-200 dark:border-border">
                                <p className="text-gray-500 dark:text-text-secondary text-sm">Next Birthday</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ageResult.daysUntilBirthday} days</p>
                            </div>
                            <div className="bg-gray-100 dark:bg-secondary p-4 rounded-lg text-center border border-gray-200 dark:border-border">
                                <p className="text-gray-500 dark:text-text-secondary text-sm">Total Days</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ageResult.totalDays.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-red-500 mt-4">Please enter a valid date of birth.</p>
                )}
            </div>
        </ToolCard>
    );
};
const WordCounter: React.FC<ToolProps> = () => {
    const [text, setText] = useState('');
    
    const stats = useMemo(() => {
        const trimmedText = text.trim();
        const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
        const characters = text.length;
        const sentences = trimmedText.split(/[.!?]+/).filter(Boolean).length;
        const paragraphs = trimmedText.split(/\n+/).filter(Boolean).length;
        return { words, characters, sentences, paragraphs };
    }, [text]);

    return (
        <ToolCard title="Word & Character Counter">
            <div className="space-y-4">
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-60 bg-white dark:bg-secondary border border-gray-300 dark:border-border rounded-md p-3 text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Start typing here..."
                ></textarea>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-gray-100 dark:bg-secondary p-4 rounded-lg border border-gray-200 dark:border-border">
                        <p className="text-2xl font-bold text-accent">{stats.words}</p>
                        <p className="text-sm text-gray-500 dark:text-text-secondary">Words</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-secondary p-4 rounded-lg border border-gray-200 dark:border-border">
                        <p className="text-2xl font-bold text-accent">{stats.characters}</p>
                        <p className="text-sm text-gray-500 dark:text-text-secondary">Characters</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-secondary p-4 rounded-lg border border-gray-200 dark:border-border">
                        <p className="text-2xl font-bold text-accent">{stats.sentences}</p>
                        <p className="text-sm text-gray-500 dark:text-text-secondary">Sentences</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-secondary p-4 rounded-lg border border-gray-200 dark:border-border">
                        <p className="text-2xl font-bold text-accent">{stats.paragraphs}</p>
                        <p className="text-sm text-gray-500 dark:text-text-secondary">Paragraphs</p>
                    </div>
                </div>
            </div>
        </ToolCard>
    );
};

const CaseConverter: React.FC<ToolProps> = () => {
    const [text, setText] = useState('');
    const toSentenceCase = () => setText(text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()));
    const toTitleCase = () => setText(text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()));
    
    return (
        <ToolCard title="Case Converter">
             <div className="space-y-4">
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-60 bg-white dark:bg-secondary border border-gray-300 dark:border-border rounded-md p-3 text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter your text here..."
                ></textarea>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="secondary" onClick={() => setText(text.toUpperCase())}>UPPERCASE</Button>
                    <Button variant="secondary" onClick={() => setText(text.toLowerCase())}>lowercase</Button>
                    <Button variant="secondary" onClick={toTitleCase}>Title Case</Button>
                    <Button variant="secondary" onClick={toSentenceCase}>Sentence case</Button>
                </div>
            </div>
        </ToolCard>
    );
};

const PasswordGenerator: React.FC<ToolProps> = () => {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({ upper: true, lower: true, numbers: true, symbols: true });
    const [copied, setCopied] = useState(false);

    const generatePassword = useCallback(() => {
        const { upper, lower, numbers, symbols } = options;
        const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let allChars = '';
        if (upper) allChars += upperChars;
        if (lower) allChars += lowerChars;
        if (numbers) allChars += numberChars;
        if (symbols) allChars += symbolChars;
        
        if (!allChars) {
            setPassword('');
            return;
        }

        let newPassword = '';
        for (let i = 0; i < length; i++) {
            newPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        setPassword(newPassword);
    }, [length, options]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolCard title="Password Generator">
            <div className="space-y-6">
                <div className="relative">
                    <Input type="text" readOnly value={password} className="font-mono text-lg pr-20"/>
                    <Button onClick={copyToClipboard} className="absolute right-2 top-1/2 -translate-y-1/2">{copied ? 'Copied!' : 'Copy'}</Button>
                </div>
                <div>
                    <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                        <span>Password Length</span>
                        <span className="font-semibold text-accent">{length}</span>
                    </label>
                    <input type="range" min="8" max="64" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(options).map(key => (
                         <label key={key} className="flex items-center space-x-2 bg-gray-100 dark:bg-secondary p-3 rounded-md border border-gray-200 dark:border-border">
                            <input type="checkbox" checked={options[key as keyof typeof options]} onChange={() => setOptions(prev => ({...prev, [key]: !prev[key]}))} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent bg-transparent dark:bg-secondary" />
                            <span className="capitalize text-sm">{key}</span>
                        </label>
                    ))}
                </div>
                <Button onClick={generatePassword} variant="secondary" className="w-full">Generate New Password</Button>
            </div>
        </ToolCard>
    );
};

const ColorPicker: React.FC<ToolProps> = () => {
    const [color, setColor] = useState('#58A6FF');
    
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
    };
    
    return (
        <ToolCard title="Color Picker & Converter">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative">
                    <div style={{ backgroundColor: color }} className="w-48 h-48 rounded-full border-8 border-white dark:border-secondary shadow-lg"></div>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"/>
                </div>
                <div className="flex-1 space-y-3 w-full">
                    <div className="bg-gray-100 dark:bg-secondary p-3 rounded-md border border-gray-200 dark:border-border">
                        <label className="text-xs text-gray-500 dark:text-text-secondary">HEX</label>
                        <p className="font-mono text-gray-900 dark:text-white">{color}</p>
                    </div>
                     <div className="bg-gray-100 dark:bg-secondary p-3 rounded-md border border-gray-200 dark:border-border">
                        <label className="text-xs text-gray-500 dark:text-text-secondary">RGB</label>
                        <p className="font-mono text-gray-900 dark:text-white">{hexToRgb(color)}</p>
                    </div>
                </div>
            </div>
        </ToolCard>
    );
};
const Calculator: React.FC<ToolProps> = () => {
    const [display, setDisplay] = useState('0');
    const [currentValue, setCurrentValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(true);

    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };
    
    const inputDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clear = () => {
        setDisplay('0');
        setCurrentValue(null);
        setOperator(null);
        setWaitingForOperand(true);
    };

    const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (currentValue === null) {
            setCurrentValue(inputValue);
        } else if (operator) {
            const result = calculate(currentValue, inputValue, operator);
            setCurrentValue(result);
            setDisplay(String(result));
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };

    const calculate = (firstOperand: number, secondOperand: number, op: string) => {
        switch (op) {
            case '+': return firstOperand + secondOperand;
            case '-': return firstOperand - secondOperand;
            case '*': return firstOperand * secondOperand;
            case '/': return firstOperand / secondOperand;
            case '=': return secondOperand;
            default: return secondOperand;
        }
    };
    
    const handleEquals = () => {
        const inputValue = parseFloat(display);
        if (operator && currentValue !== null) {
            const result = calculate(currentValue, inputValue, operator);
            setDisplay(String(result));
            setCurrentValue(result);
            setOperator(null);
            setWaitingForOperand(true);
        }
    };

    return (
        <ToolCard>
            <div className="max-w-xs mx-auto">
                <div className="bg-gray-200 dark:bg-secondary p-4 rounded-lg mb-4 text-right">
                    <p className="font-mono text-4xl text-gray-900 dark:text-white break-all">{display}</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <Button variant="calculator" onClick={clear} className="bg-red-400 dark:bg-red-800 text-white hover:bg-red-500 dark:hover:bg-red-700">C</Button>
                    <Button variant="calculator" onClick={() => setDisplay(String(parseFloat(display) * -1))}>+/-</Button>
                    <Button variant="calculator" onClick={() => setDisplay(String(parseFloat(display) / 100))}>%</Button>
                    <Button variant="calculator" onClick={() => performOperation('/')} className="bg-orange-400 dark:bg-orange-800 text-white hover:bg-orange-500 dark:hover:bg-orange-700">÷</Button>
                    
                    <Button variant="calculator" onClick={() => inputDigit('7')}>7</Button>
                    <Button variant="calculator" onClick={() => inputDigit('8')}>8</Button>
                    <Button variant="calculator" onClick={() => inputDigit('9')}>9</Button>
                    <Button variant="calculator" onClick={() => performOperation('*')} className="bg-orange-400 dark:bg-orange-800 text-white hover:bg-orange-500 dark:hover:bg-orange-700">×</Button>

                    <Button variant="calculator" onClick={() => inputDigit('4')}>4</Button>
                    <Button variant="calculator" onClick={() => inputDigit('5')}>5</Button>
                    <Button variant="calculator" onClick={() => inputDigit('6')}>6</Button>
                    <Button variant="calculator" onClick={() => performOperation('-')} className="bg-orange-400 dark:bg-orange-800 text-white hover:bg-orange-500 dark:hover:bg-orange-700">−</Button>

                    <Button variant="calculator" onClick={() => inputDigit('1')}>1</Button>
                    <Button variant="calculator" onClick={() => inputDigit('2')}>2</Button>
                    <Button variant="calculator" onClick={() => inputDigit('3')}>3</Button>
                    <Button variant="calculator" onClick={() => performOperation('+')} className="bg-orange-400 dark:bg-orange-800 text-white hover:bg-orange-500 dark:hover:bg-orange-700">+</Button>

                    <Button variant="calculator" onClick={() => inputDigit('0')} className="col-span-2">0</Button>
                    <Button variant="calculator" onClick={inputDecimal}>.</Button>
                    <Button variant="calculator" onClick={handleEquals} className="bg-orange-400 dark:bg-orange-800 text-white hover:bg-orange-500 dark:hover:bg-orange-700">=</Button>
                </div>
            </div>
        </ToolCard>
    );
};

const CurrencyConverter: React.FC<ToolProps> = () => {
    // Common currencies with their codes
    const commonCurrencies = [
        'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BRL',
        'RUB', 'KRW', 'MXN', 'ZAR', 'SGD', 'HKD', 'NOK', 'SEK', 'DKK', 'NZD',
        'TRY', 'PLN', 'THB', 'IDR', 'MYR', 'PHP', 'CZK', 'ILS', 'AED', 'SAR'
    ];

    const [amount, setAmount] = useState('1');
    const [from, setFrom] = useState('USD');
    const [to, setTo] = useState('EUR');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    const convert = useCallback(async () => {
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (from === to) {
            setResult(amountNum.toFixed(2));
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Using the free Frankfurter API (hosted by European Central Bank)
            // This API doesn't require authentication
            const response = await fetch(
                `https://api.frankfurter.app/latest?amount=${amountNum}&from=${from}&to=${to}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }

            const data = await response.json();
            
            if (data.rates && data.rates[to]) {
                setResult(data.rates[to].toFixed(2));
                setLastUpdate(new Date(data.date).toLocaleDateString());
            } else {
                throw new Error('Invalid currency pair');
            }
        } catch (err) {
            console.error('Currency conversion error:', err);
            setError('Unable to fetch exchange rates. Please try again.');
            setResult(null);
        } finally {
            setLoading(false);
        }
    }, [amount, from, to]);

    // Auto-convert when inputs change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (amount && parseFloat(amount) > 0) {
                convert();
            }
        }, 500); // Debounce for 500ms

        return () => clearTimeout(timer);
    }, [amount, from, to, convert]);

    const swapCurrencies = () => {
        setFrom(to);
        setTo(from);
    };

    return (
        <ToolCard title="Currency Converter">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Amount</label>
                        <Input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">From</label>
                        <Select value={from} onChange={e => setFrom(e.target.value)}>
                            {commonCurrencies.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">To</label>
                        <div className="flex gap-2">
                            <Select value={to} onChange={e => setTo(e.target.value)} className="flex-1">
                                {commonCurrencies.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </Select>
                            <button
                                onClick={swapCurrencies}
                                className="px-3 py-2 bg-gray-200 dark:bg-secondary rounded-lg hover:bg-gray-300 dark:hover:bg-border transition-colors"
                                title="Swap currencies"
                            >
                                ⇄
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="text-center text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="text-center text-gray-500 dark:text-text-secondary">
                        <div className="animate-pulse">Loading exchange rate...</div>
                    </div>
                )}

                {!loading && result && !error && (
                    <div className="text-center bg-gray-100 dark:bg-secondary p-6 rounded-lg mt-4">
                        <p className="text-gray-500 dark:text-text-secondary text-lg">
                            {amount} {from} =
                        </p>
                        <p className="text-4xl font-bold text-accent mt-2">
                            {result} {to}
                        </p>
                        {lastUpdate && (
                            <p className="text-xs text-gray-400 dark:text-text-secondary mt-2">
                                Exchange rate as of {lastUpdate}
                            </p>
                        )}
                    </div>
                )}

                <div className="text-xs text-gray-400 dark:text-text-secondary text-center mt-4">
                    Exchange rates provided by Frankfurter API (European Central Bank data)
                </div>
            </div>
        </ToolCard>
    );
};

const TipCalculator: React.FC<ToolProps> = ({ selectedCurrency = defaultCurrency }) => {
    const [bill, setBill] = useState('50.00');
    const [tipPercent, setTipPercent] = useState('15');
    const [people, setPeople] = useState('1');
    const tipOptions = ['10', '15', '18', '20', '25'];

    const result = useMemo(() => {
        const billAmount = parseFloat(bill);
        const tip = parseFloat(tipPercent);
        const numPeople = parseInt(people, 10);

        if (isNaN(billAmount) || isNaN(tip) || isNaN(numPeople) || billAmount <= 0 || numPeople <= 0) {
            return { tipPerPerson: '0.00', totalPerPerson: '0.00' };
        }

        const tipAmount = billAmount * (tip / 100);
        const totalAmount = billAmount + tipAmount;
        const tipPerPerson = tipAmount / numPeople;
        const totalPerPerson = totalAmount / numPeople;
        
        return {
            tipPerPerson: tipPerPerson.toFixed(2),
            totalPerPerson: totalPerPerson.toFixed(2)
        };
    }, [bill, tipPercent, people]);

    return (
        <ToolCard>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2 space-y-4">
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Bill Amount</label>
                        <Input type="number" value={bill} onChange={e => setBill(e.target.value)} min="0" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Select Tip %</label>
                        <div className="grid grid-cols-3 gap-2">
                           {tipOptions.map(p => (
                               <Button key={p} variant={tipPercent === p ? 'primary' : 'secondary'} onClick={() => setTipPercent(p)}>
                                   {p}%
                               </Button>
                           ))}
                            <Input type="number" placeholder="Custom" className="text-center" value={tipOptions.includes(tipPercent) ? '' : tipPercent} onChange={e => setTipPercent(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Number of People</label>
                        <Input type="number" value={people} onChange={e => setPeople(e.target.value)} min="1" />
                    </div>
                </div>
                <div className="md:w-1/2 bg-accent dark:bg-accent/90 p-6 rounded-lg flex flex-col justify-between text-white">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p>Tip Amount</p>
                                <p className="text-sm text-gray-200">/ person</p>
                            </div>
                            <p className="text-3xl font-bold">{selectedCurrency.symbol}{result.tipPerPerson}</p>
                        </div>
                         <div className="flex justify-between items-center">
                            <div>
                                <p>Total</p>
                                <p className="text-sm text-gray-200">/ person</p>
                            </div>
                            <p className="text-3xl font-bold">{selectedCurrency.symbol}{result.totalPerPerson}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ToolCard>
    );
};
const DateCalculator: React.FC<ToolProps> = () => {
    const [mode, setMode] = useState<'difference' | 'addSubtract'>('difference');

    // State for difference calculator
    const today = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];
    const [startDateDiff, setStartDateDiff] = useState(today);
    const [endDateDiff, setEndDateDiff] = useState(tomorrow);
    const [diffResult, setDiffResult] = useState<{ years: number, months: number, days: number, totalDays: number } | null>(null);

    // State for add/subtract calculator
    const [startDateAdd, setStartDateAdd] = useState(today);
    const [days, setDays] = useState('30');
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');
    const [addResult, setAddResult] = useState<string | null>(null);
    
    const calculateDifference = useCallback(() => {
        const d1 = new Date(startDateDiff);
        const d2 = new Date(endDateDiff);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d1 > d2) {
            setDiffResult(null);
            return;
        }

        const totalDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

        let years = d2.getFullYear() - d1.getFullYear();
        let months = d2.getMonth() - d1.getMonth();
        let days = d2.getDate() - d1.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
            days += lastMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        setDiffResult({ years, months, days, totalDays });
    }, [startDateDiff, endDateDiff]);

    const calculateAddSubtract = useCallback(() => {
        const startDate = new Date(startDateAdd);
        const numDays = parseInt(days, 10);

        if (isNaN(startDate.getTime()) || isNaN(numDays)) {
            setAddResult(null);
            return;
        }

        const resultDate = new Date(startDate);
        const dayModifier = operation === 'add' ? numDays : -numDays;
        resultDate.setDate(resultDate.getDate() + dayModifier);

        setAddResult(resultDate.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })); // YYYY-MM-DD format
    }, [startDateAdd, days, operation]);

    useEffect(() => {
        if (mode === 'difference') {
            calculateDifference();
        }
    }, [startDateDiff, endDateDiff, mode, calculateDifference]);

    useEffect(() => {
        if (mode === 'addSubtract') {
            calculateAddSubtract();
        }
    }, [startDateAdd, days, operation, mode, calculateAddSubtract]);

    const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
        <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-accent text-white' : 'text-gray-600 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-secondary'}`}>
            {children}
        </button>
    );

    return (
        <ToolCard title="Date Calculator">
            <div className="flex justify-center mb-6">
                <div className="bg-gray-100 dark:bg-secondary p-1 rounded-lg flex space-x-1">
                    <TabButton active={mode === 'difference'} onClick={() => setMode('difference')}>Date Difference</TabButton>
                    <TabButton active={mode === 'addSubtract'} onClick={() => setMode('addSubtract')}>Add/Subtract Days</TabButton>
                </div>
            </div>

            {mode === 'difference' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Start Date</label>
                            <Input type="date" value={startDateDiff} onChange={e => setStartDateDiff(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">End Date</label>
                            <Input type="date" value={endDateDiff} onChange={e => setEndDateDiff(e.target.value)} />
                        </div>
                    </div>
                    {diffResult ? (
                        <div className="text-center bg-gray-100 dark:bg-secondary p-6 rounded-lg mt-4">
                            <p className="text-gray-500 dark:text-text-secondary text-lg">Difference</p>
                            <p className="text-4xl font-bold text-accent mb-2">
                                {diffResult.totalDays} Day{diffResult.totalDays !== 1 && 's'}
                            </p>
                            <p className="text-md text-gray-600 dark:text-text-primary">
                                {diffResult.years > 0 && `${diffResult.years} year${diffResult.years > 1 ? 's' : ''}, `}
                                {diffResult.months > 0 && `${diffResult.months} month${diffResult.months > 1 ? 's' : ''}, `}
                                {diffResult.days} day{diffResult.days !== 1 && 's'}
                            </p>
                        </div>
                    ) : (
                         <p className="text-center text-red-500 mt-4">Please select a valid date range, with the end date after the start date.</p>
                    )}
                </div>
            )}

            {mode === 'addSubtract' && (
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Start Date</label>
                            <Input type="date" value={startDateAdd} onChange={e => setStartDateAdd(e.target.value)} />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center space-x-1 cursor-pointer">
                                    <input type="radio" name="operation" value="add" checked={operation === 'add'} onChange={() => setOperation('add')} className="form-radio h-4 w-4 text-accent bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-accent" />
                                    <span>Add</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                    <input type="radio" name="operation" value="subtract" checked={operation === 'subtract'} onChange={() => setOperation('subtract')} className="form-radio h-4 w-4 text-accent bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-accent" />
                                    <span>Subtract</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                         <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Days to {operation}</label>
                         <Input type="number" value={days} onChange={e => setDays(e.target.value)} min="0" />
                    </div>
                     {addResult ? (
                        <div className="text-center bg-gray-100 dark:bg-secondary p-6 rounded-lg mt-4">
                            <p className="text-gray-500 dark:text-text-secondary text-lg">Resulting Date</p>
                            <p className="text-4xl font-bold text-accent">{addResult}</p>
                        </div>
                    ) : (
                        <p className="text-center text-red-500 mt-4">Please enter a valid start date and number of days.</p>
                    )}
                </div>
            )}
        </ToolCard>
    );
};

const EMICalculator: React.FC<ToolProps> = ({ selectedCurrency = defaultCurrency }) => {
    const [principal, setPrincipal] = useState(100000);
    const [rate, setRate] = useState(6.5);
    const [tenure, setTenure] = useState(10); // in years

    const result = useMemo(() => {
        const p = principal;
        const r = rate / 12 / 100;
        const n = tenure * 12;

        if (p <= 0 || r <= 0 || n <= 0) {
            return { monthlyEMI: 0, totalInterest: 0, totalPayment: 0 };
        }

        const emi = (p * r * (1 + r) ** n) / ((1 + r) ** n - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - p;

        return {
            monthlyEMI: emi,
            totalInterest: totalInterest,
            totalPayment: totalPayment,
        };
    }, [principal, rate, tenure]);
    
    const PieChart = ({ principal, interest }: { principal: number, interest: number }) => {
        const total = principal + interest;
        if (total === 0) return null;
        const interestAngle = (interest / total) * 360;
        const largeArcFlag = interestAngle > 180 ? 1 : 0;
        const x = 50 + 40 * Math.cos(Math.PI * (interestAngle - 90) / 180);
        const y = 50 + 40 * Math.sin(Math.PI * (interestAngle - 90) / 180);
        
        return (
            <svg viewBox="0 0 100 100" className="w-48 h-48">
                <circle cx="50" cy="50" r="40" className="fill-current text-accent/50" />
                <path d={`M50 50 L50 10 A40 40 0 ${largeArcFlag} 1 ${x} ${y} Z`} className="fill-current text-accent" />
            </svg>
        );
    };

    return (
        <ToolCard title="EMI Calculator">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2 space-y-4">
                    <div>
                        <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                            <span>Loan Amount</span>
                            <span className="font-semibold text-accent">{selectedCurrency.symbol}{principal.toLocaleString()}</span>
                        </label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                min="1000" 
                                max="10000000" 
                                step="1000"
                                value={principal} 
                                onChange={e => {
                                    const val = Math.max(1000, Math.min(10000000, Number(e.target.value) || 1000));
                                    setPrincipal(val);
                                }}
                                className="flex-1"
                            />
                            <input 
                                type="range" 
                                min="1000" 
                                max="1000000" 
                                step="1000" 
                                value={principal} 
                                onChange={e => setPrincipal(Number(e.target.value))} 
                                className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                            />
                        </div>
                    </div>
                     <div>
                        <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                            <span>Interest Rate (%)</span>
                            <span className="font-semibold text-accent">{rate.toFixed(2)}%</span>
                        </label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                min="0.1" 
                                max="30" 
                                step="0.1"
                                value={rate} 
                                onChange={e => {
                                    const val = Math.max(0.1, Math.min(30, Number(e.target.value) || 0.1));
                                    setRate(val);
                                }}
                                className="flex-1"
                            />
                            <input 
                                type="range" 
                                min="1" 
                                max="20" 
                                step="0.1" 
                                value={rate} 
                                onChange={e => setRate(Number(e.target.value))} 
                                className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                            />
                        </div>
                    </div>
                     <div>
                        <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                            <span>Loan Tenure (Years)</span>
                            <span className="font-semibold text-accent">{tenure} years</span>
                        </label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                min="1" 
                                max="50" 
                                step="1"
                                value={tenure} 
                                onChange={e => {
                                    const val = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                                    setTenure(val);
                                }}
                                className="flex-1"
                            />
                            <input 
                                type="range" 
                                min="1" 
                                max="30" 
                                step="1" 
                                value={tenure} 
                                onChange={e => setTenure(Number(e.target.value))} 
                                className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                            />
                        </div>
                    </div>
                </div>
                <div className="md:w-1/2 flex flex-col items-center justify-center bg-gray-100 dark:bg-secondary p-6 rounded-lg">
                    <p className="text-gray-500 dark:text-text-secondary">Monthly EMI</p>
                    <p className="text-4xl font-bold text-accent mb-4">{selectedCurrency.symbol}{result.monthlyEMI.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <PieChart principal={principal} interest={result.totalInterest} />
                     <div className="mt-4 w-full text-sm">
                        <div className="flex justify-between py-1">
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-accent/50 mr-2"></span>Principal Amount</span>
                            <span>{selectedCurrency.symbol}{principal.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between py-1">
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-accent mr-2"></span>Total Interest</span>
                            <span>{selectedCurrency.symbol}{result.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-gray-300 dark:border-border mt-1 font-semibold">
                            <span>Total Payment</span>
                             <span>{selectedCurrency.symbol}{result.totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </ToolCard>
    );
};

const ProfitLossCalculator: React.FC<ToolProps> = ({ selectedCurrency = defaultCurrency }) => {
    const [costPrice, setCostPrice] = useState('100');
    const [sellingPrice, setSellingPrice] = useState('120');

    const result = useMemo(() => {
        const cp = parseFloat(costPrice);
        const sp = parseFloat(sellingPrice);

        if (isNaN(cp) || isNaN(sp) || cp <= 0) {
            return null;
        }

        const difference = sp - cp;
        const isProfit = difference >= 0;
        const percentage = (difference / cp) * 100;

        return {
            amount: Math.abs(difference),
            percentage: Math.abs(percentage),
            isProfit,
        };
    }, [costPrice, sellingPrice]);

    return (
        <ToolCard title="Profit & Loss Calculator">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Cost Price</label>
                        <Input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} min="0" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Selling Price</label>
                        <Input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} min="0" />
                    </div>
                </div>
                {result && (
                    <div className={`text-center p-6 rounded-lg mt-4 ${result.isProfit ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                        <p className={`text-lg font-semibold ${result.isProfit ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                            {result.isProfit ? 'Profit' : 'Loss'}
                        </p>
                        <p className={`text-4xl font-bold ${result.isProfit ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                            {selectedCurrency.symbol}{result.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className={`text-xl font-medium ${result.isProfit ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                            {result.percentage.toFixed(2)}%
                        </p>
                    </div>
                )}
            </div>
        </ToolCard>
    );
};

const SimpleInterestCalculator: React.FC<ToolProps> = ({ selectedCurrency = defaultCurrency }) => {
    const [principal, setPrincipal] = useState(10000);
    const [rate, setRate] = useState(5);
    const [tenure, setTenure] = useState(5); // in years

    const result = useMemo(() => {
        const p = principal;
        const r = rate / 100;
        const t = tenure;

        if (p <= 0 || r < 0 || t <= 0) {
            return { interest: 0, totalAmount: p };
        }
        
        const interest = p * r * t;
        const totalAmount = p + interest;

        return {
            interest,
            totalAmount,
        };
    }, [principal, rate, tenure]);
    
    return (
        <ToolCard title="Simple Interest Calculator">
            <div className="space-y-6">
                <div>
                    <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                        <span>Principal Amount</span>
                        <span className="font-semibold text-accent">{selectedCurrency.symbol}{principal.toLocaleString()}</span>
                    </label>
                    <div className="flex gap-2">
                        <Input 
                            type="number" 
                            min="1000" 
                            max="10000000" 
                            step="1000"
                            value={principal} 
                            onChange={e => {
                                const val = Math.max(1000, Math.min(10000000, Number(e.target.value) || 1000));
                                setPrincipal(val);
                            }}
                            className="flex-1"
                        />
                        <input 
                            type="range" 
                            min="1000" 
                            max="1000000" 
                            step="1000" 
                            value={principal} 
                            onChange={e => setPrincipal(Number(e.target.value))} 
                            className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                        />
                    </div>
                </div>
                 <div>
                    <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                        <span>Rate of Interest (% p.a.)</span>
                        <span className="font-semibold text-accent">{rate.toFixed(2)}%</span>
                    </label>
                    <div className="flex gap-2">
                        <Input 
                            type="number" 
                            min="0" 
                            max="30" 
                            step="0.1"
                            value={rate} 
                            onChange={e => {
                                const val = Math.max(0, Math.min(30, Number(e.target.value) || 0));
                                setRate(val);
                            }}
                            className="flex-1"
                        />
                        <input 
                            type="range" 
                            min="0" 
                            max="20" 
                            step="0.1" 
                            value={rate} 
                            onChange={e => setRate(Number(e.target.value))} 
                            className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                        />
                    </div>
                </div>
                 <div>
                    <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                        <span>Time Period (Years)</span>
                        <span className="font-semibold text-accent">{tenure} years</span>
                    </label>
                    <div className="flex gap-2">
                        <Input 
                            type="number" 
                            min="1" 
                            max="50" 
                            step="1"
                            value={tenure} 
                            onChange={e => {
                                const val = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                                setTenure(val);
                            }}
                            className="flex-1"
                        />
                        <input 
                            type="range" 
                            min="1" 
                            max="30" 
                            step="1" 
                            value={tenure} 
                            onChange={e => setTenure(Number(e.target.value))} 
                            className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                        />
                    </div>
                </div>

                <div className="bg-gray-100 dark:bg-secondary p-6 rounded-lg mt-4 space-y-4">
                     <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600 dark:text-text-secondary">Principal Amount</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedCurrency.symbol}{principal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600 dark:text-text-secondary">Total Interest</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedCurrency.symbol}{result.interest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                     <div className="flex justify-between items-center text-2xl font-bold pt-4 border-t border-gray-300 dark:border-border">
                        <span className="text-gray-700 dark:text-text-primary">Total Amount</span>
                        <span className="text-accent">{selectedCurrency.symbol}{result.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        </ToolCard>
    );
};

const SIPCalculator: React.FC<ToolProps> = ({ selectedCurrency = defaultCurrency }) => {
    const [investment, setInvestment] = useState(5000); // monthly
    const [rate, setRate] = useState(12); // expected return rate
    const [tenure, setTenure] = useState(10); // years

    const result = useMemo(() => {
        const i = investment;
        const r = rate / 100 / 12; // monthly rate
        const n = tenure * 12; // number of months

        if (i <= 0 || rate < 0 || n <= 0) {
            const investedAmount = i * n;
            return { investedAmount: investedAmount, estimatedReturns: 0, totalValue: investedAmount };
        }

        const totalValue = i * (((1 + r) ** n - 1) / r) * (1 + r);
        const investedAmount = i * n;
        const estimatedReturns = totalValue - investedAmount;

        return {
            investedAmount,
            estimatedReturns,
            totalValue,
        };
    }, [investment, rate, tenure]);

    const PieChart = ({ principal, interest }: { principal: number, interest: number }) => {
        const total = principal + interest;
        if (total === 0 || interest <= 0) {
            return (
                <svg viewBox="0 0 100 100" className="w-48 h-48">
                    <circle cx="50" cy="50" r="40" className="fill-current text-accent/50" />
                </svg>
            );
        }
        const interestAngle = (interest / total) * 360;
        const largeArcFlag = interestAngle > 180 ? 1 : 0;
        const x = 50 + 40 * Math.cos(Math.PI * (interestAngle - 90) / 180);
        const y = 50 + 40 * Math.sin(Math.PI * (interestAngle - 90) / 180);
        
        return (
            <svg viewBox="0 0 100 100" className="w-48 h-48">
                <circle cx="50" cy="50" r="40" className="fill-current text-accent/50" />
                <path d={`M50 50 L50 10 A40 40 0 ${largeArcFlag} 1 ${x} ${y} Z`} className="fill-current text-accent" />
            </svg>
        );
    };

    return (
        <ToolCard title="SIP Calculator">
             <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2 space-y-4">
                    <div>
                        <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                            <span>Monthly Investment</span>
                            <span className="font-semibold text-accent">{selectedCurrency.symbol}{investment.toLocaleString()}</span>
                        </label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                min="500" 
                                max="1000000" 
                                step="500"
                                value={investment} 
                                onChange={e => {
                                    const val = Math.max(500, Math.min(1000000, Number(e.target.value) || 500));
                                    setInvestment(val);
                                }}
                                className="flex-1"
                            />
                            <input 
                                type="range" 
                                min="500" 
                                max="100000" 
                                step="500" 
                                value={investment} 
                                onChange={e => setInvestment(Number(e.target.value))} 
                                className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                            />
                        </div>
                    </div>
                     <div>
                        <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                            <span>Expected Return Rate (% p.a.)</span>
                            <span className="font-semibold text-accent">{rate.toFixed(1)}%</span>
                        </label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                min="0" 
                                max="50" 
                                step="0.5"
                                value={rate} 
                                onChange={e => {
                                    const val = Math.max(0, Math.min(50, Number(e.target.value) || 0));
                                    setRate(val);
                                }}
                                className="flex-1"
                            />
                            <input 
                                type="range" 
                                min="0" 
                                max="30" 
                                step="0.5" 
                                value={rate} 
                                onChange={e => setRate(Number(e.target.value))} 
                                className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                            />
                        </div>
                    </div>
                     <div>
                        <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                            <span>Time Period (Years)</span>
                            <span className="font-semibold text-accent">{tenure} years</span>
                        </label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                min="1" 
                                max="60" 
                                step="1"
                                value={tenure} 
                                onChange={e => {
                                    const val = Math.max(1, Math.min(60, Number(e.target.value) || 1));
                                    setTenure(val);
                                }}
                                className="flex-1"
                            />
                            <input 
                                type="range" 
                                min="1" 
                                max="40" 
                                step="1" 
                                value={tenure} 
                                onChange={e => setTenure(Number(e.target.value))} 
                                className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                            />
                        </div>
                    </div>
                </div>
                <div className="md:w-1/2 flex flex-col items-center justify-center bg-gray-100 dark:bg-secondary p-6 rounded-lg">
                    <p className="text-gray-500 dark:text-text-secondary">Total Value</p>
                    <p className="text-4xl font-bold text-accent mb-4">{selectedCurrency.symbol}{result.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <PieChart principal={result.investedAmount} interest={result.estimatedReturns} />
                     <div className="mt-4 w-full text-sm">
                        <div className="flex justify-between py-1">
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-accent/50 mr-2"></span>Invested Amount</span>
                            <span>{selectedCurrency.symbol}{result.investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                         <div className="flex justify-between py-1">
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-accent mr-2"></span>Est. Returns</span>
                            <span>{selectedCurrency.symbol}{result.estimatedReturns.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-gray-300 dark:border-border mt-1 font-semibold">
                            <span>Total Value</span>
                             <span>{selectedCurrency.symbol}{result.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </ToolCard>
    );
};

const CompoundInterestCalculator: React.FC<ToolProps> = ({ selectedCurrency = defaultCurrency }) => {
    const [principal, setPrincipal] = useState(10000);
    const [rate, setRate] = useState(7);
    const [tenure, setTenure] = useState(10);
    const [compoundsPerYear, setCompoundsPerYear] = useState(12);

    const result = useMemo(() => {
        const P = principal;
        const r = rate / 100;
        const n = compoundsPerYear;
        const t = tenure;

        if (P <= 0 || r < 0 || t <= 0) {
            return { totalValue: P, totalInterest: 0 };
        }

        const totalValue = P * Math.pow(1 + r / n, n * t);
        const totalInterest = totalValue - P;

        return { totalValue, totalInterest };
    }, [principal, rate, tenure, compoundsPerYear]);
    
    const PieChart = ({ principal, interest }: { principal: number, interest: number }) => {
        const total = principal + interest;
        if (total === 0 || interest <= 0) {
            return <svg viewBox="0 0 100 100" className="w-48 h-48"><circle cx="50" cy="50" r="40" className="fill-current text-accent/50" /></svg>;
        }
        const interestAngle = (interest / total) * 360;
        const largeArcFlag = interestAngle > 180 ? 1 : 0;
        const x = 50 + 40 * Math.cos(Math.PI * (interestAngle - 90) / 180);
        const y = 50 + 40 * Math.sin(Math.PI * (interestAngle - 90) / 180);
        return (
            <svg viewBox="0 0 100 100" className="w-48 h-48">
                <circle cx="50" cy="50" r="40" className="fill-current text-accent/50" />
                <path d={`M50 50 L50 10 A40 40 0 ${largeArcFlag} 1 ${x} ${y} Z`} className="fill-current text-accent" />
            </svg>
        );
    };

    return (
        <ToolCard title="Compound Interest Calculator">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2 space-y-4">
                    <div>
                        <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                            <span>Principal Amount</span>
                            <span className="font-semibold text-accent">{selectedCurrency.symbol}{principal.toLocaleString()}</span>
                        </label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                min="1000" 
                                max="10000000" 
                                step="1000"
                                value={principal} 
                                onChange={e => {
                                    const val = Math.max(1000, Math.min(10000000, Number(e.target.value) || 1000));
                                    setPrincipal(val);
                                }}
                                className="flex-1"
                            />
                            <input 
                                type="range" 
                                min="1000" 
                                max="1000000" 
                                step="1000" 
                                value={principal} 
                                onChange={e => setPrincipal(Number(e.target.value))} 
                                className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                            <span>Annual Interest Rate (%)</span>
                            <span className="font-semibold text-accent">{rate.toFixed(1)}%</span>
                        </label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                min="0" 
                                max="50" 
                                step="0.5"
                                value={rate} 
                                onChange={e => {
                                    const val = Math.max(0, Math.min(50, Number(e.target.value) || 0));
                                    setRate(val);
                                }}
                                className="flex-1"
                            />
                            <input 
                                type="range" 
                                min="0" 
                                max="30" 
                                step="0.5" 
                                value={rate} 
                                onChange={e => setRate(Number(e.target.value))} 
                                className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="flex justify-between text-sm text-gray-500 dark:text-text-secondary mb-1">
                            <span>Time Period (Years)</span>
                            <span className="font-semibold text-accent">{tenure} years</span>
                        </label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                min="1" 
                                max="60" 
                                step="1"
                                value={tenure} 
                                onChange={e => {
                                    const val = Math.max(1, Math.min(60, Number(e.target.value) || 1));
                                    setTenure(val);
                                }}
                                className="flex-1"
                            />
                            <input 
                                type="range" 
                                min="1" 
                                max="40" 
                                step="1" 
                                value={tenure} 
                                onChange={e => setTenure(Number(e.target.value))} 
                                className="flex-1 h-2 bg-gray-200 dark:bg-secondary rounded-lg appearance-none cursor-pointer accent-accent" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary mb-1">Compounding Frequency</label>
                        <Select value={compoundsPerYear} onChange={e => setCompoundsPerYear(Number(e.target.value))}>
                            <option value="1">Annually</option>
                            <option value="2">Semi-Annually</option>
                            <option value="4">Quarterly</option>
                            <option value="12">Monthly</option>
                        </Select>
                    </div>
                </div>
                <div className="md:w-1/2 flex flex-col items-center justify-center bg-gray-100 dark:bg-secondary p-6 rounded-lg">
                    <p className="text-gray-500 dark:text-text-secondary">Future Value</p>
                    <p className="text-4xl font-bold text-accent mb-4">{selectedCurrency.symbol}{result.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <PieChart principal={principal} interest={result.totalInterest} />
                    <div className="mt-4 w-full text-sm">
                        <div className="flex justify-between py-1">
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-accent/50 mr-2"></span>Principal</span>
                            <span>{selectedCurrency.symbol}{principal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-accent mr-2"></span>Total Interest</span>
                            <span>{selectedCurrency.symbol}{result.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </ToolCard>
    );
};

const PercentageCalculator: React.FC<ToolProps> = () => {
    const [mode, setMode] = useState<'percentOf' | 'isWhatPercent' | 'percentChange'>('percentOf');
    const [val1, setVal1] = useState('10');
    const [val2, setVal2] = useState('50');

    const result = useMemo(() => {
        const v1 = parseFloat(val1);
        const v2 = parseFloat(val2);
        if (isNaN(v1) || isNaN(v2)) return null;
        try {
            switch (mode) {
                case 'percentOf': return ((v1 / 100) * v2).toLocaleString();
                case 'isWhatPercent': return v2 !== 0 ? `${((v1 / v2) * 100).toLocaleString()}%` : 'N/A';
                case 'percentChange': return v1 !== 0 ? `${(((v2 - v1) / v1) * 100).toLocaleString()}%` : 'N/A';
                default: return null;
            }
        } catch { return 'Error'; }
    }, [mode, val1, val2]);

    const labels = {
        percentOf: { v1: 'Percent (%)', v2: 'Of Value', question: `What is ${val1}% of ${val2}?` },
        isWhatPercent: { v1: 'Value A', v2: 'Value B', question: `${val1} is what percent of ${val2}?` },
        percentChange: { v1: 'Initial Value', v2: 'Final Value', question: `Percentage change from ${val1} to ${val2}?` },
    };

    const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
        <button onClick={onClick} className={`px-3 py-1 text-sm rounded-md transition-colors ${active ? 'bg-accent text-white' : 'text-gray-600 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-secondary'}`}>{children}</button>
    );

    return (
        <ToolCard title="Percentage Calculator">
            <div className="flex justify-center mb-4">
                <div className="bg-gray-100 dark:bg-secondary p-1 rounded-lg flex space-x-1">
                    <TabButton active={mode === 'percentOf'} onClick={() => setMode('percentOf')}>X% of Y</TabButton>
                    <TabButton active={mode === 'isWhatPercent'} onClick={() => setMode('isWhatPercent')}>X is what % of Y</TabButton>
                    <TabButton active={mode === 'percentChange'} onClick={() => setMode('percentChange')}>% Change</TabButton>
                </div>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">{labels[mode].v1}</label>
                        <Input type="number" value={val1} onChange={e => setVal1(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">{labels[mode].v2}</label>
                        <Input type="number" value={val2} onChange={e => setVal2(e.target.value)} />
                    </div>
                </div>
                {result !== null && (
                    <div className="text-center bg-gray-100 dark:bg-secondary p-6 rounded-lg mt-4">
                        <p className="text-gray-500 dark:text-text-secondary text-sm">{labels[mode].question}</p>
                        <p className="text-4xl font-bold text-accent">{result}</p>
                    </div>
                )}
            </div>
        </ToolCard>
    );
};

const DiscountCalculator: React.FC<ToolProps> = ({ selectedCurrency = defaultCurrency }) => {
    const [price, setPrice] = useState('100');
    const [discount, setDiscount] = useState('20');
    
    const result = useMemo(() => {
        const p = parseFloat(price);
        const d = parseFloat(discount);
        if (isNaN(p) || isNaN(d) || p < 0 || d < 0) return null;
        const saved = (p * d) / 100;
        const finalPrice = p - saved;
        return { finalPrice, saved };
    }, [price, discount]);

    return (
        <ToolCard title="Discount Calculator">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Original Price</label>
                        <Input type="number" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-text-secondary block mb-1">Discount (%)</label>
                        <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} />
                    </div>
                </div>
                {result && (
                    <div className="bg-gray-100 dark:bg-secondary p-6 rounded-lg mt-4 space-y-4">
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-gray-600 dark:text-text-secondary">You Save</span>
                            <span className="font-semibold text-green-500">{selectedCurrency.symbol}{result.saved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-bold pt-4 border-t border-gray-300 dark:border-border">
                            <span className="text-gray-700 dark:text-text-primary">Final Price</span>
                            <span className="text-accent">{selectedCurrency.symbol}{result.finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                )}
            </div>
        </ToolCard>
    );
};

const LoremIpsumGenerator: React.FC<ToolProps> = () => {
    const [count, setCount] = useState(3);
    const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);
    
    const loremWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'curabitur', 'vel', 'hendrerit', 'libero', 'eleifend', 'blandit', 'nunc', 'ornare', 'odio', 'ut', 'orci', 'gravida', 'imperdiet', 'nullam', 'purus', 'lacinia', 'a', 'pretium', 'quis', 'congue', 'praesent', 'sagittis', 'laoreet', 'auctor', 'mauris', 'non', 'velit', 'eros', 'dictum', 'proin', 'accumsan', 'sapien', 'nec', 'massa', 'volutpat', 'venenatis', 'sed', 'eu', 'molestie', 'lacus', 'quisque', 'porttitor', 'ligula', 'dui', 'mollis', 'tempus', 'at', 'magna', 'vestibulum', 'turpis', 'ac', 'diam', 'tincidunt', 'id', 'condimentum', 'enim', 'sodales', 'in', 'hac', 'habitasse', 'platea', 'dictumst', 'aenean', 'neque', 'fusce', 'augue', 'leo', 'eget', 'semper', 'mattis', 'tortor', 'scelerisque', 'nulla', 'interdum', 'tellus', 'malesuada', 'rhoncus', 'porta', 'sem', 'aliquet', 'et', 'nam', 'suspendisse', 'potenti', 'vivamus', 'luctus', 'fringilla', 'erat', 'donec', 'justo', 'vehicula', 'ultricies', 'varius', 'ante', 'primis', 'in', 'faucibus', 'orci', 'luctus', 'et', 'ultrices', 'posuere', 'cubilia', 'curae', 'etiam', 'cursus', 'aliquam', 'quam', 'dapibus'];

    const generateText = useCallback(() => {
        let result = '';
        if (count <= 0) { setText(''); return; }

        const makeWord = () => loremWords[Math.floor(Math.random() * loremWords.length)];
        const makeSentence = () => {
            const len = Math.floor(Math.random() * 10) + 5;
            let s = '';
            for(let i = 0; i < len; i++) s += makeWord() + ' ';
            return s.trim().charAt(0).toUpperCase() + s.trim().slice(1) + '.';
        };
        const makeParagraph = () => {
            const len = Math.floor(Math.random() * 4) + 3;
            let p = '';
            for(let i = 0; i < len; i++) p += makeSentence() + ' ';
            return p.trim();
        }

        if (type === 'words') {
            for(let i = 0; i < count; i++) result += makeWord() + ' ';
        } else if (type === 'sentences') {
            for(let i = 0; i < count; i++) result += makeSentence() + ' ';
        } else {
            for(let i = 0; i < count; i++) result += makeParagraph() + '\n\n';
        }

        setText(result.trim());
    }, [count, type]);

    useEffect(generateText, [generateText]);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolCard title="Lorem Ipsum Generator">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input type="number" value={count} onChange={e => setCount(Math.max(0, parseInt(e.target.value)) || 0)} />
                    <Select value={type} onChange={e => setType(e.target.value as any)}>
                        <option value="paragraphs">Paragraphs</option>
                        <option value="sentences">Sentences</option>
                        <option value="words">Words</option>
                    </Select>
                </div>
                <textarea readOnly value={text} className="w-full h-60 bg-gray-100 dark:bg-secondary border border-gray-300 dark:border-border rounded-md p-3" />
                <Button onClick={copyToClipboard} className="w-full">{copied ? 'Copied!' : 'Copy to Clipboard'}</Button>
            </div>
        </ToolCard>
    );
};

const EmojiRemover: React.FC<ToolProps> = () => {
    const [inputText, setInputText] = useState('Here is some text with emojis 😂👍 and symbols  symbols... ✨');
    const [copied, setCopied] = useState(false);
    
    const cleanedText = useMemo(() => {
        // A comprehensive regex to remove most emojis and some pictographs
        const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
        return inputText.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();
    }, [inputText]);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(cleanedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolCard title="Emoji Remover / Text Cleaner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm">Input Text</label>
                    <textarea value={inputText} onChange={e => setInputText(e.target.value)} className="w-full h-48 bg-white dark:bg-secondary border border-gray-300 dark:border-border rounded-md p-3" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm">Cleaned Text</label>
                    <textarea readOnly value={cleanedText} className="w-full h-48 bg-gray-100 dark:bg-secondary border border-gray-300 dark:border-border rounded-md p-3" />
                </div>
            </div>
            <Button onClick={copyToClipboard} className="w-full mt-4">{copied ? 'Copied!' : 'Copy Cleaned Text'}</Button>
        </ToolCard>
    );
};

const ImageResizer: React.FC<ToolProps> = () => {
    const [image, setImage] = useState<string | null>(null);
    const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
    const [newDims, setNewDims] = useState({ w: 0, h: 0 });
    const [quality, setQuality] = useState(0.8);
    const [fileName, setFileName] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img.src);
                    setOriginalDims({ w: img.width, h: img.height });
                    setNewDims({ w: img.width, h: img.height });
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleWidthChange = (w: number) => {
        const ratio = originalDims.h / originalDims.w;
        setNewDims({ w, h: Math.round(w * ratio) });
    };

    const handleDownload = () => {
        if (!canvasRef.current || !image) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = newDims.w;
            canvas.height = newDims.h;
            ctx?.drawImage(img, 0, 0, newDims.w, newDims.h);
            const link = document.createElement('a');
            link.download = `resized-${fileName}`;
            link.href = canvas.toDataURL('image/jpeg', quality);
            link.click();
        };
        img.src = image;
    };

    return (
        <ToolCard title="Image Resizer & Compressor">
            <div className="space-y-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                {image && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold">Settings</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm">Width</label>
                                    <Input type="number" value={newDims.w} onChange={e => handleWidthChange(parseInt(e.target.value) || 0)} />
                                </div>
                                <div>
                                    <label className="text-sm">Height</label>
                                    <Input type="number" value={newDims.h} readOnly className="bg-gray-200 dark:bg-gray-700" />
                                </div>
                            </div>
                            <div>
                                <label className="flex justify-between text-sm"><span>Quality</span><span className="font-semibold text-accent">{Math.round(quality*100)}%</span></label>
                                <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} className="w-full" />
                            </div>
                            <Button onClick={handleDownload} className="w-full">Download Resized Image</Button>
                        </div>
                        <div className="flex flex-col items-center">
                            <h4 className="font-semibold mb-2">Preview</h4>
                            <img src={image} alt="Preview" className="max-w-full max-h-64 rounded-md border border-gray-200 dark:border-border" />
                            <p className="text-xs text-gray-500 mt-1">Original: {originalDims.w}x{originalDims.h}</p>
                        </div>
                    </div>
                )}
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </ToolCard>
    );
};

const PhotoEditor: React.FC<ToolProps> = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isFlippedH, setIsFlippedH] = useState(false);
    const [isFlippedV, setIsFlippedV] = useState(false);
    const [filter, setFilter] = useState<'none' | 'grayscale' | 'sepia' | 'invert' | 'blur'>('none');
    const [text, setText] = useState('');
    const [textX, setTextX] = useState(50);
    const [textY, setTextY] = useState(50);
    const [fontSize, setFontSize] = useState(24);
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [textStrokeColor, setTextStrokeColor] = useState('#000000');

    const loadImage = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setImage(img);
                setImageUrl(e.target?.result as string);
                // Reset adjustments
                setBrightness(100);
                setContrast(100);
                setSaturation(100);
                setRotation(0);
                setIsFlippedH(false);
                setIsFlippedV(false);
                setFilter('none');
                setText('');
                // Set default text position to center
                setTextX(Math.floor(img.width / 2));
                setTextY(Math.floor(img.height / 2));
                setFontSize(24);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const applyFilters = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.save();
        
        // Apply rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        
        // Apply flips
        if (isFlippedH) ctx.scale(-1, 1);
        if (isFlippedV) ctx.scale(1, -1);
        
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        
        // Draw image
        ctx.drawImage(image, 0, 0);
        
        // Apply filters using CSS filters (canvas filter support varies)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Brightness
            r = Math.min(255, (r * brightness) / 100);
            g = Math.min(255, (g * brightness) / 100);
            b = Math.min(255, (b * brightness) / 100);
            
            // Contrast
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
            g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
            b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
            
            // Saturation
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = Math.min(255, gray + (r - gray) * (saturation / 100));
            g = Math.min(255, gray + (g - gray) * (saturation / 100));
            b = Math.min(255, gray + (b - gray) * (saturation / 100));
            
            // Filters
            if (filter === 'grayscale') {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = g = b = gray;
            } else if (filter === 'sepia') {
                const tr = (r * 0.393) + (g * 0.769) + (b * 0.189);
                const tg = (r * 0.349) + (g * 0.686) + (b * 0.168);
                const tb = (r * 0.272) + (g * 0.534) + (b * 0.131);
                r = Math.min(255, tr);
                g = Math.min(255, tg);
                b = Math.min(255, tb);
            } else if (filter === 'invert') {
                r = 255 - r;
                g = 255 - g;
                b = 255 - b;
            }
            
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add text if provided
        if (text) {
            ctx.save();
            ctx.font = `bold ${fontSize}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = textColor;
            ctx.strokeStyle = textStrokeColor;
            ctx.lineWidth = 3;
            ctx.fillText(text, textX, textY);
            ctx.strokeText(text, textX, textY);
            ctx.restore();
        }
        
        ctx.restore();
    }, [image, brightness, contrast, saturation, rotation, isFlippedH, isFlippedV, filter, text, textX, textY, fontSize, textColor, textStrokeColor]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited-image.png';
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    return (
        <ToolCard title="Photo Editor">
            <div className="space-y-4">
                <Input type="file" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        loadImage(e.target.files[0]);
                    }
                }} />
                
                {image && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <div className="bg-gray-100 dark:bg-secondary rounded-lg p-4 overflow-auto max-h-[600px] flex items-center justify-center">
                                <canvas ref={canvasRef} className="max-w-full h-auto rounded-md shadow-lg" />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="flex justify-between text-sm mb-1">
                                    <span>Brightness</span>
                                    <span className="font-semibold text-accent">{brightness}%</span>
                                </label>
                                <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full accent-accent" />
                            </div>
                            
                            <div>
                                <label className="flex justify-between text-sm mb-1">
                                    <span>Contrast</span>
                                    <span className="font-semibold text-accent">{contrast}%</span>
                                </label>
                                <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-accent" />
                            </div>
                            
                            <div>
                                <label className="flex justify-between text-sm mb-1">
                                    <span>Saturation</span>
                                    <span className="font-semibold text-accent">{saturation}%</span>
                                </label>
                                <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="w-full accent-accent" />
                            </div>
                            
                            <div>
                                <label className="flex justify-between text-sm mb-1">
                                    <span>Rotation</span>
                                    <span className="font-semibold text-accent">{rotation}°</span>
                                </label>
                                <input type="range" min="-180" max="180" step="1" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full accent-accent" />
                                <div className="flex gap-2 mt-2">
                                    <Button variant="secondary" onClick={() => setRotation((r) => (r - 90) % 360)} className="flex-1">Rotate Left</Button>
                                    <Button variant="secondary" onClick={() => setRotation((r) => (r + 90) % 360)} className="flex-1">Rotate Right</Button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm mb-2 block">Flip</label>
                                <div className="flex gap-2">
                                    <Button variant={isFlippedH ? 'primary' : 'secondary'} onClick={() => setIsFlippedH(!isFlippedH)} className="flex-1">Flip H</Button>
                                    <Button variant={isFlippedV ? 'primary' : 'secondary'} onClick={() => setIsFlippedV(!isFlippedV)} className="flex-1">Flip V</Button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm mb-2 block">Filter</label>
                                <Select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                                    <option value="none">None</option>
                                    <option value="grayscale">Grayscale</option>
                                    <option value="sepia">Sepia</option>
                                    <option value="invert">Invert</option>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="text-sm mb-2 block">Add Text</label>
                                <Input type="text" placeholder="Enter text..." value={text} onChange={(e) => setText(e.target.value)} className="mb-2" />
                                {text && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-text-secondary">X Position</label>
                                                <Input type="number" value={textX} onChange={(e) => setTextX(Number(e.target.value))} className="text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-text-secondary">Y Position</label>
                                                <Input type="number" value={textY} onChange={(e) => setTextY(Number(e.target.value))} className="text-sm" />
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <label className="text-xs text-gray-500 dark:text-text-secondary mb-1 block">Font Size: {fontSize}px</label>
                                            <input type="range" min="12" max="120" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-accent" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-text-secondary mb-1 block">Text Color</label>
                                                <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-10" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-text-secondary mb-1 block">Stroke Color</label>
                                                <Input type="color" value={textStrokeColor} onChange={(e) => setTextStrokeColor(e.target.value)} className="h-10" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => {
                                    if (image) {
                                        setBrightness(100);
                                        setContrast(100);
                                        setSaturation(100);
                                        setRotation(0);
                                        setIsFlippedH(false);
                                        setIsFlippedV(false);
                                        setFilter('none');
                                        setText('');
                                        setTextX(Math.floor(image.width / 2));
                                        setTextY(Math.floor(image.height / 2));
                                        setFontSize(24);
                                    }
                                }} className="flex-1">Reset</Button>
                                <Button onClick={handleDownload} className="flex-1">Download</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolCard>
    );
};
/* old version landing page
const LandingPage: React.FC<ToolProps> = () => {
    const categories = [
        { name: 'Time', description: 'Precision tools for time management.', icon: <Icons.TimerIcon /> },
        { name: 'Converters', description: 'Effortlessly convert between various units.', icon: <Icons.SwitchHorizontalIcon /> },
        { name: 'Health & Lifestyle', description: 'Monitor and maintain a healthy lifestyle.', icon: <Icons.HeartIcon /> },
        { name: 'Text', description: 'Manipulate and analyze text with ease.', icon: <Icons.DocumentTextIcon /> },
        { name: 'Developer', description: 'Handy utilities to streamline your workflow.', icon: <Icons.CodeIcon /> },
        { name: 'Calculation', description: 'From simple arithmetic to complex finance.', icon: <Icons.CalculatorIcon /> },
        { name: 'Image', description: 'Resize, compress, and edit your images.', icon: <Icons.PhotographIcon /> },
    ];

    const [contactMessage, setContactMessage] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const handleSendMail = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent("Feedback for utilifyy");
        const bodyText = userEmail 
            ? `Message from: ${userEmail}\n\n${contactMessage}` 
            : contactMessage;
        const body = encodeURIComponent(bodyText);
        window.location.href = `mailto:harshshinde818@gmail.com?subject=${subject}&body=${body}`;
    };

    // FIX: The `icon` prop was updated to be a ReactElement that accepts a `className` prop, which is necessary for `React.cloneElement` to work without a TypeScript error.
    const FeatureCard: React.FC<{ icon: React.ReactElement<{ className?: string }>, title: string, description: string }> = ({ icon, title, description }) => (
        <div className="bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg p-6 flex items-start space-x-4 transition-all hover:shadow-lg hover:border-accent/50">
            <div className="flex-shrink-0 w-12 h-12 bg-accent/10 dark:bg-accent/20 text-accent rounded-lg flex items-center justify-center">
                {React.cloneElement(icon, { className: "w-6 h-6" })}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-text-secondary">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="text-center p-8 bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to utilifyy</h2>
                <p className="mt-2 text-lg text-gray-500 dark:text-text-secondary">Your All-in-One Suite of Free, Client-Side Utility Tools.</p>
                <p className="mt-4 max-w-2xl mx-auto text-gray-600 dark:text-text-primary">
                    Everything you need in one place. Fast, private, and always available. No data ever leaves your browser. Select a tool from the sidebar to get started!
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => <FeatureCard key={cat.name} title={cat.name} description={cat.description} icon={cat.icon} />)}
            </div>

            <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-border text-center text-gray-500 dark:text-text-secondary">
                <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-text-primary mb-2">Contact Us</h3>
                    <p className="text-sm mb-4">Have feedback or a feature request? We'd love to hear from you!</p>
                    <form onSubmit={handleSendMail} className="space-y-4 text-left">
                        <Input 
                            type="email" 
                            placeholder="Your Email (Optional)" 
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                        />
                        <textarea
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            className="w-full h-24 bg-white dark:bg-secondary border border-gray-300 dark:border-border rounded-md p-3 text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Your message..."
                            required
                        ></textarea>
                        <Button type="submit" className="w-full">Send Mail</Button>
                    </form>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-border max-w-md mx-auto text-left text-xs">
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-text-primary mb-2">Privacy Policy</h4>
                    <p className="leading-relaxed text-gray-600 dark:text-text-secondary">
                        All calculations and data processing are performed entirely in your browser. No data is sent to external servers. Your privacy is our priority.
                    </p>
                </div>
                
                <p className="mt-8 text-xs">Version 1.0</p>
            </footer>
        </div>
    );
};
*/

// Enhanced Landing Page Component with Rich Content for AdSense
const LandingPage = () => {
    const tools = [
      {
        category: 'Time Management Tools',
        description: 'Professional time tracking and management utilities for productivity',
        tools: [
          { name: 'Stopwatch', desc: 'High-precision stopwatch with lap timing for sports, workouts, and time tracking' },
          { name: 'Timer', desc: 'Countdown timer with audio alerts for cooking, studying, and time management' },
          { name: 'World Clock', desc: 'Multi-timezone clock for international business and travel planning' },
          { name: 'Chess Clock', desc: 'Dual player timer for chess, board games, and competitive activities' }
        ]
      },
      {
        category: 'Financial Calculators',
        description: 'Advanced financial tools for investment planning and money management',
        tools: [
          { name: 'EMI Calculator', desc: 'Calculate monthly loan payments for home loans, car loans, and personal loans' },
          { name: 'SIP Calculator', desc: 'Systematic Investment Plan calculator for mutual fund investments' },
          { name: 'Compound Interest', desc: 'Calculate compound interest for long-term investments and savings' },
          { name: 'Simple Interest', desc: 'Quick simple interest calculator for loans and deposits' },
          { name: 'Discount Calculator', desc: 'Calculate sale prices, discounts, and savings on purchases' },
          { name: 'Tip Calculator', desc: 'Split bills and calculate tips for dining and services' },
          { name: 'Profit & Loss', desc: 'Calculate profit margins and losses for business transactions' }
        ]
      },
      {
        category: 'Unit Converters',
        description: 'Comprehensive unit conversion tools for everyday calculations',
        tools: [
          { name: 'Length Converter', desc: 'Convert between meters, feet, inches, kilometers, and miles' },
          { name: 'Weight Converter', desc: 'Convert kilograms, pounds, ounces, and other weight units' },
          { name: 'Temperature Converter', desc: 'Convert Celsius, Fahrenheit, and Kelvin temperatures' },
          { name: 'Currency Converter', desc: 'Real-time currency exchange rates for global currencies' }
        ]
      },
      {
        category: 'Text Tools',
        description: 'Professional text editing and formatting utilities',
        tools: [
          { name: 'Word Counter', desc: 'Count words, characters, sentences, and paragraphs in your text' },
          { name: 'Case Converter', desc: 'Convert text to uppercase, lowercase, title case, and sentence case' },
          { name: 'Lorem Ipsum Generator', desc: 'Generate placeholder text for design and development projects' },
          { name: 'Emoji Remover', desc: 'Clean text by removing emojis and special characters' }
        ]
      },
      {
        category: 'Health & Lifestyle',
        description: 'Health calculators for wellness and lifestyle management',
        tools: [
          { name: 'BMI Calculator', desc: 'Calculate Body Mass Index to assess healthy weight ranges' },
          { name: 'Age Calculator', desc: 'Calculate exact age and days until next birthday' }
        ]
      },
      {
        category: 'Image Tools',
        description: 'Professional image editing and optimization tools',
        tools: [
          { name: 'Image Resizer', desc: 'Resize and compress images for web and social media' },
          { name: 'Photo Editor', desc: 'Edit photos with filters, adjustments, and text overlays' }
        ]
      },
      {
        category: 'Developer Tools',
        description: 'Essential utilities for web developers and designers',
        tools: [
          { name: 'Password Generator', desc: 'Create strong, secure passwords with customizable options' },
          { name: 'Color Picker', desc: 'Pick colors and get HEX, RGB codes for web design' }
        ]
      }
    ];
  
    const features = [
      {
        title: 'Privacy First',
        desc: 'All calculations happen in your browser. Your data never leaves your device.',
        icon: '🔒'
      },
      {
        title: 'Always Free',
        desc: 'No subscriptions, no hidden fees. All tools are completely free to use.',
        icon: '💰'
      },
      {
        title: 'No Login Required',
        desc: 'Start using tools immediately without creating an account.',
        icon: '⚡'
      },
      {
        title: 'Mobile Friendly',
        desc: 'Fully responsive design works perfectly on all devices.',
        icon: '📱'
      }
    ];
  
    return (
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center p-8 bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Free Online Utility Tools - Utilifyy
          </h1>
          <p className="text-xl text-gray-600 dark:text-text-secondary mb-6">
            Your Complete Toolkit for Everyday Tasks
          </p>
          <p className="max-w-3xl mx-auto text-gray-700 dark:text-text-primary leading-relaxed">
            Utilifyy is a comprehensive collection of free online tools designed to make your daily tasks easier. 
            From financial calculators to text editors, unit converters to image tools, we provide everything you need 
            in one convenient location. All tools work directly in your browser with complete privacy - no data is ever sent to our servers.
          </p>
        </section>
  
        {/* Features */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Why Choose Utilifyy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-text-secondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
  
        {/* Tools Categories */}
        {tools.map((category, idx) => (
          <section key={idx} className="bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{category.category}</h2>
            <p className="text-gray-600 dark:text-text-secondary mb-6">{category.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.tools.map((tool, tidx) => (
                <div key={tidx} className="border-l-4 border-accent pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-text-secondary">{tool.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
  
        {/* How to Use */}
        <section className="bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use Utilifyy Tools</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold mr-4">1</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Select Your Tool</h3>
                <p className="text-gray-600 dark:text-text-secondary">Browse through our categories in the sidebar and click on any tool you need.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold mr-4">2</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Enter Your Data</h3>
                <p className="text-gray-600 dark:text-text-secondary">Input your values, text, or upload files as needed for the specific tool.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold mr-4">3</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Get Instant Results</h3>
                <p className="text-gray-600 dark:text-text-secondary">All calculations and conversions happen instantly in your browser.</p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Blog-style Content */}
        <section className="bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Understanding Financial Calculators</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-text-primary mb-4">
              Financial planning is crucial for achieving your monetary goals. Our suite of financial calculators helps you make informed decisions about loans, investments, and savings. Whether you're planning to buy a home, invest in mutual funds, or simply want to understand your returns, these tools provide accurate calculations instantly.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">EMI Calculator: Plan Your Loan Repayment</h3>
            <p className="text-gray-700 dark:text-text-primary mb-4">
              An EMI (Equated Monthly Installment) calculator helps you determine your monthly loan payment amount. By inputting your loan amount, interest rate, and tenure, you can see exactly how much you'll pay each month and the total interest over the loan period. This is essential for budgeting and comparing loan offers from different lenders.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">SIP Calculator: Grow Your Wealth</h3>
            <p className="text-gray-700 dark:text-text-primary mb-4">
              Systematic Investment Plans (SIP) are one of the most popular investment methods in mutual funds. Our SIP calculator shows you how small, regular investments can grow into substantial wealth over time through the power of compounding. Input your monthly investment, expected return rate, and investment period to see your potential returns.
            </p>
          </div>
        </section>
  
        {/* FAQ Section */}
        <section className="bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Are Utilifyy tools really free?</h3>
              <p className="text-gray-600 dark:text-text-secondary">Yes, all our tools are completely free to use. There are no hidden charges, premium features, or subscription plans. We believe in providing accessible utilities for everyone.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is my data safe?</h3>
              <p className="text-gray-600 dark:text-text-secondary">Absolutely. All tools run entirely in your browser using client-side JavaScript. Your data never leaves your device, and we don't store any information on our servers.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Do I need to create an account?</h3>
              <p className="text-gray-600 dark:text-text-secondary">No account is required. Simply visit the website and start using any tool immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I use these tools on mobile?</h3>
              <p className="text-gray-600 dark:text-text-secondary">Yes, Utilifyy is fully responsive and works perfectly on all devices including smartphones, tablets, and desktop computers.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How accurate are the calculators?</h3>
              <p className="text-gray-600 dark:text-text-secondary">Our calculators use industry-standard formulas and are thoroughly tested for accuracy. However, they should be used for estimation purposes. For critical financial decisions, please consult with a professional advisor.</p>
            </div>
          </div>
        </section>
  
        {/* Footer Content */}
        <footer className="bg-white dark:bg-primary border border-gray-200 dark:border-border rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About Utilifyy</h3>
              <p className="text-sm text-gray-600 dark:text-text-secondary">
                Utilifyy is your one-stop destination for free online utility tools. We're committed to providing fast, reliable, and privacy-focused tools for everyday tasks.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Popular Tools</h3>
              <ul className="text-sm text-gray-600 dark:text-text-secondary space-y-2">
                <li>• EMI Calculator</li>
                <li>• Unit Converter</li>
                <li>• Password Generator</li>
                <li>• Image Resizer</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact</h3>
              <p className="text-sm text-gray-600 dark:text-text-secondary">
                Have suggestions or feedback? Reach out to us at harshshinde818@gmail.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-border pt-6 text-center text-sm text-gray-600 dark:text-text-secondary">
            <p>Free online tools for everyone.</p>
            <p className="mt-2">Privacy-first • No tracking • Always free</p>
          </div>
        </footer>
        <footer className="text-center text-sm text-gray-500 dark:text-text-secondary py-6">
            <nav className="space-x-4">
            <a href="/about" className="hover:text-accent">About Us</a>
            <a href="/privacy" className="hover:text-accent">Privacy Policy</a>
            <a href="/contact" className="hover:text-accent">Contact Us</a>
            </nav>
            <p className="mt-2">© {new Date().getFullYear()} Utilifyy. All rights reserved.</p>
        </footer>



      </div>
    );
  };


export const AllTools = {
    Stopwatch, Timer, WorldClock, ChessClock, UnitConverter, BMICalculator, AgeCalculator,
    WordCounter, CaseConverter, PasswordGenerator, ColorPicker,
    Calculator, CurrencyConverter, TipCalculator, DateCalculator, EMICalculator,
    ProfitLossCalculator, SimpleInterestCalculator, SIPCalculator,
    CompoundInterestCalculator, PercentageCalculator, DiscountCalculator,
    LoremIpsumGenerator, EmojiRemover, ImageResizer, PhotoEditor,
    LandingPage
};
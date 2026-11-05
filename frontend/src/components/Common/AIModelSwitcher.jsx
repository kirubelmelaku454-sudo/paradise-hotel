import React, { useState, useRef, useEffect } from 'react';

/**
 * Model Branding, Colors, and Superpowers
 */
export const AI_MODELS = [
    {
        id: 'gemini',
        name: 'Gemini',
        fullName: 'Google Gemini 2.0 Flash',
        company: 'Google',
        tagline: 'Ultra-fast & Multilingual',
        color: '#4285F4',
        gradient: 'linear-gradient(135deg, #4285F4 0%, #9B72CB 50%, #D96570 100%)',
        bgLight: 'rgba(66, 133, 244, 0.12)',
        border: 'rgba(66, 133, 244, 0.45)',
        thinkingText: 'Gemini is thinking...',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#gemini_grad)" />
                <defs>
                    <linearGradient id="gemini_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4285F4" />
                        <stop offset="0.5" stopColor="#9B72CB" />
                        <stop offset="1" stopColor="#D96570" />
                    </linearGradient>
                </defs>
            </svg>
        )
    },
    {
        id: 'chatgpt',
        name: 'ChatGPT',
        fullName: 'OpenAI ChatGPT-4o',
        company: 'OpenAI',
        tagline: 'Versatile & Creative',
        color: '#10a37f',
        gradient: 'linear-gradient(135deg, #10a37f 0%, #0d8c6d 100%)',
        bgLight: 'rgba(16, 163, 127, 0.12)',
        border: 'rgba(16, 163, 127, 0.45)',
        thinkingText: 'ChatGPT is drafting...',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" color="#10a37f" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.28 10.37a5.55 5.55 0 0 0-.47-4.42 5.67 5.67 0 0 0-4.64-2.83 5.54 5.54 0 0 0-3.86.85 5.57 5.57 0 0 0-5.74.34 5.67 5.67 0 0 0-3.32 3.86 5.55 5.55 0 0 0-2.22 3.83 5.67 5.67 0 0 0 1.25 4.93 5.55 5.55 0 0 0 .47 4.42 5.67 5.67 0 0 0 4.64 2.83 5.54 5.54 0 0 0 3.86-.85 5.57 5.57 0 0 0 5.74-.34 5.67 5.67 0 0 0 3.32-3.86 5.55 5.55 0 0 0 2.22-3.83 5.67 5.67 0 0 0-1.25-4.94zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
            </svg>
        )
    },
    {
        id: 'claude',
        name: 'Claude',
        fullName: 'Anthropic Claude 3.5',
        company: 'Anthropic',
        tagline: 'Nuanced & Eloquent',
        color: '#d97706',
        gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        bgLight: 'rgba(217, 119, 6, 0.12)',
        border: 'rgba(217, 119, 6, 0.45)',
        thinkingText: 'Claude is composing...',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" color="#d97706" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        )
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        fullName: 'DeepSeek V3 & R1',
        company: 'DeepSeek',
        tagline: 'Deep Cognitive Reasoning',
        color: '#2563eb',
        gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        bgLight: 'rgba(37, 99, 235, 0.12)',
        border: 'rgba(37, 99, 235, 0.45)',
        thinkingText: 'DeepSeek is reasoning...',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12c1.5-3 4-5 8-5s6.5 2 12 5c-1.5 3-4 5-8 5s-6.5-2-12-5z" />
                <circle cx="12" cy="12" r="3" fill="#2563eb" />
                <path d="M17 10c1 0 2 .5 2 1.5" />
            </svg>
        )
    }
];

export default function AIModelSwitcher({
    selectedModel = 'gemini',
    onSelectModel,
    disabled = false,
    viewMode = 'pills' // 'pills' | 'dropdown'
}) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (viewMode === 'dropdown') {
        return (
            <div className="ai-model-dropdown-container" ref={dropdownRef}>
                <button
                    type="button"
                    className="ai-model-trigger-btn"
                    onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
                    style={{
                        borderColor: currentModel.border,
                        background: currentModel.bgLight
                    }}
                    title={`Switch AI Model (Currently: ${currentModel.fullName})`}
                    disabled={disabled}
                >
                    <span className="model-trigger-icon">{currentModel.icon}</span>
                    <span className="model-trigger-name" style={{ color: currentModel.color }}>
                        {currentModel.name}
                    </span>
                    <span className="model-trigger-caret">▾</span>
                </button>

                {dropdownOpen && (
                    <div className="ai-model-menu-popup animate-fade-in">
                        <div className="ai-model-menu-header">
                            <span className="title">Select AI Engine</span>
                            <span className="badge">Multi-Model</span>
                        </div>
                        {AI_MODELS.map((model) => {
                            const isSelected = model.id === selectedModel;
                            return (
                                <button
                                    key={model.id}
                                    type="button"
                                    className={`ai-model-menu-item ${isSelected ? 'active' : ''}`}
                                    onClick={() => {
                                        onSelectModel(model.id);
                                        setDropdownOpen(false);
                                    }}
                                    style={{
                                        borderColor: isSelected ? model.color : 'transparent',
                                        background: isSelected ? model.bgLight : 'transparent'
                                    }}
                                >
                                    <div className="item-icon-box">{model.icon}</div>
                                    <div className="item-text-box">
                                        <div className="item-name-row">
                                            <span className="item-name" style={{ color: isSelected ? model.color : 'inherit' }}>
                                                {model.name}
                                            </span>
                                            <span className="item-company">{model.company}</span>
                                        </div>
                                        <div className="item-tagline">{model.tagline}</div>
                                    </div>
                                    {isSelected && <span className="item-check" style={{ color: model.color }}>✓</span>}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Default 'pills' display mode (horizontal row of model buttons)
    return (
        <div className="ai-model-pills-bar" role="tablist" aria-label="AI Model Selection">
            <div className="model-bar-label">
                <span className="pulse-dot" style={{ background: currentModel.color }} />
                <span>AI Model:</span>
            </div>
            <div className="model-pills-scroll">
                {AI_MODELS.map((model) => {
                    const isSelected = model.id === selectedModel;
                    return (
                        <button
                            key={model.id}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            className={`model-pill-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => !disabled && onSelectModel(model.id)}
                            disabled={disabled}
                            style={{
                                '--pill-color': model.color,
                                '--pill-bg': model.bgLight,
                                '--pill-border': model.border
                            }}
                            title={`${model.fullName} (${model.company}) — ${model.tagline}`}
                        >
                            <span className="pill-icon">{model.icon}</span>
                            <span className="pill-name">{model.name}</span>
                            {isSelected && <span className="pill-live-dot" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


/**
 * Theme Selector Component
 * Provides a dropdown interface for selecting themes including the improved dark mode
 */

class ThemeSelector {
    constructor() {
        this.themes = {
            'light': {
                name: 'Light Theme',
                description: 'Classic light theme',
                css: [],
                isDefault: true
            },
            'dark': {
                name: 'Dark Theme',
                description: 'Original dark theme',
                css: ['dark/base', 'dark/nav', 'dark/preferences']
            },
            'dark_improved': {
                name: 'Improved Dark',
                description: 'Modern dark theme with lighter tones',
                css: ['dark_improved/base', 'dark_improved/nav', 'dark_improved/preferences']
            }
        };
        
        this.currentTheme = this.getCurrentTheme();
        this.init();
    }
    
    init() {
        this.createThemeSelector();
        this.bindEvents();
        this.loadTheme(this.currentTheme);
    }
    
    createThemeSelector() {
        // Create theme selector dropdown
        const themeSelector = document.createElement('div');
        themeSelector.className = 'theme-selector-dropdown';
        themeSelector.innerHTML = `
            <div class="theme-selector-trigger">
                <i class="fas fa-palette"></i>
                <span class="theme-name">${this.themes[this.currentTheme].name}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="theme-selector-menu">
                ${Object.entries(this.themes).map(([key, theme]) => `
                    <div class="theme-option ${key === this.currentTheme ? 'selected' : ''}" data-theme="${key}">
                        <div class="theme-preview">
                            <div class="color-swatch" style="background: ${this.getThemeColor(key)}"></div>
                            <div class="theme-info">
                                <h5>${theme.name}</h5>
                                <p>${theme.description}</p>
                            </div>
                        </div>
                        <i class="fas fa-check theme-check"></i>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Insert into header or create a container
        const header = document.querySelector('.header') || document.querySelector('header');
        if (header) {
            header.appendChild(themeSelector);
        } else {
            // Fallback: add to body
            document.body.insertBefore(themeSelector, document.body.firstChild);
        }
    }
    
    getThemeColor(themeKey) {
        const colors = {
            'light': '#ffffff',
            'dark': '#0d0d0b',
            'dark_improved': '#1a1a1a'
        };
        return colors[themeKey] || '#ffffff';
    }
    
    bindEvents() {
        const trigger = document.querySelector('.theme-selector-trigger');
        const menu = document.querySelector('.theme-selector-menu');
        const options = document.querySelectorAll('.theme-option');
        
        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
            trigger.classList.toggle('open');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeSelector.contains(e.target)) {
                menu.classList.remove('open');
                trigger.classList.remove('open');
            }
        });
        
        // Theme selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const themeKey = option.dataset.theme;
                this.selectTheme(themeKey);
                menu.classList.remove('open');
                trigger.classList.remove('open');
            });
        });
        
        // Keyboard navigation
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                menu.classList.toggle('open');
                trigger.classList.toggle('open');
            }
        });
    }
    
    selectTheme(themeKey) {
        if (this.themes[themeKey]) {
            this.currentTheme = themeKey;
            this.loadTheme(themeKey);
            this.updateUI(themeKey);
            this.saveTheme(themeKey);
        }
    }
    
    loadTheme(themeKey) {
        // Remove existing theme stylesheets
        this.removeThemeStyles();
        
        // Load new theme stylesheets
        const theme = this.themes[themeKey];
        if (theme.css && theme.css.length > 0) {
            theme.css.forEach(cssFile => {
                this.loadStylesheet(cssFile);
            });
        }
        
        // Update body class for theme-specific styling
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        if (themeKey !== 'light') {
            document.body.classList.add(`theme-${themeKey}`);
        }
    }
    
    removeThemeStyles() {
        // Remove existing theme stylesheets
        const existingStyles = document.querySelectorAll('link[data-theme-style]');
        existingStyles.forEach(style => style.remove());
    }
    
    loadStylesheet(cssFile) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/static/css/${cssFile}.css`;
        link.setAttribute('data-theme-style', 'true');
        document.head.appendChild(link);
    }
    
    updateUI(themeKey) {
        const themeName = document.querySelector('.theme-name');
        const selectedOption = document.querySelector('.theme-option.selected');
        const newSelectedOption = document.querySelector(`[data-theme="${themeKey}"]`);
        
        if (themeName) {
            themeName.textContent = this.themes[themeKey].name;
        }
        
        if (selectedOption) {
            selectedOption.classList.remove('selected');
        }
        
        if (newSelectedOption) {
            newSelectedOption.classList.add('selected');
        }
    }
    
    saveTheme(themeKey) {
        // Save to localStorage for non-authenticated users
        localStorage.setItem('selected-theme', themeKey);
        
        // For authenticated users, we'll need to make an AJAX call
        if (window.user && window.user.is_authenticated) {
            this.saveThemeToServer(themeKey);
        }
    }
    
    saveThemeToServer(themeKey) {
        fetch('/preferences/save-theme/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify({
                theme: themeKey
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Theme saved successfully');
            } else {
                console.error('Failed to save theme:', data.error);
            }
        })
        .catch(error => {
            console.error('Error saving theme:', error);
        });
    }
    
    getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        return token ? token.value : '';
    }
    
    getCurrentTheme() {
        // Check if user is authenticated and has a saved theme
        if (window.user && window.user.is_authenticated && window.user.theme) {
            return window.user.theme;
        }
        
        // Check localStorage
        const savedTheme = localStorage.getItem('selected-theme');
        if (savedTheme && this.themes[savedTheme]) {
            return savedTheme;
        }
        
        // Check for existing dark mode
        if (document.body.classList.contains('dark-mode') || 
            document.querySelector('link[href*="dark/"]')) {
            return 'dark';
        }
        
        // Default to light theme
        return 'light';
    }
}

// Initialize theme selector when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new ThemeSelector();
});

// Export for potential external use
window.ThemeSelector = ThemeSelector;
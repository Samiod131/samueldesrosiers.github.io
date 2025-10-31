/**
 * Portfolio Website JavaScript
 * Handles navigation, animations, and interactivity
 */

// ========================================
// Navigation & Section Management
// ========================================

/**
 * Show a specific section and hide others
 * @param {string} sectionId - The ID of the section to show
 */
function showSection(sectionId) {
  // Get all sections
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.sidebar nav a');
  
  // Hide all sections with fade-out
  sections.forEach(section => {
    section.classList.add('hidden');
    section.classList.remove('fade-in');
  });
  
  // Show selected section with fade-in animation
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove('hidden');
    // Trigger reflow to restart animation
    void targetSection.offsetWidth;
    targetSection.classList.add('fade-in');
    
    // Scroll to top of main content smoothly
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  
  // Update active state in navigation
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('onclick')?.includes(sectionId)) {
      link.classList.add('active');
    }
  });
  
  // Update URL hash without scrolling
  if (history.pushState) {
    history.pushState(null, null, `#${sectionId}`);
  }
  
  // Store current section in localStorage
  localStorage.setItem('lastSection', sectionId);
}

/**
 * Initialize the page on load
 */
function initializePage() {
  // Check URL hash or localStorage for last viewed section
  const hash = window.location.hash.substring(1);
  const lastSection = localStorage.getItem('lastSection');
  const defaultSection = 'about';
  
  let sectionToShow = defaultSection;
  
  if (hash && document.getElementById(hash)) {
    sectionToShow = hash;
  } else if (lastSection && document.getElementById(lastSection)) {
    sectionToShow = lastSection;
  }
  
  showSection(sectionToShow);
  
  // Add keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
      showSection(hash);
    }
  });
  
  // Add animation on scroll for articles
  observeArticles();
  
  // Initialize tooltips if any
  initializeTooltips();
}

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleKeyboardNavigation(e) {
  const sections = ['about', 'experience', 'education', 'projects', 'me'];
  const currentHash = window.location.hash.substring(1) || 'about';
  const currentIndex = sections.indexOf(currentHash);
  
  // Arrow key navigation
  if (e.key === 'ArrowRight' && currentIndex < sections.length - 1) {
    showSection(sections[currentIndex + 1]);
  } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
    showSection(sections[currentIndex - 1]);
  }
}

// ========================================
// Animations & Observers
// ========================================

/**
 * Observe articles for scroll animations
 */
function observeArticles() {
  const articles = document.querySelectorAll('article');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '0';
          entry.target.style.transform = 'translateY(20px)';
          
          // Trigger animation
          setTimeout(() => {
            entry.target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, 100);
          
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    articles.forEach(article => observer.observe(article));
  }
}

/**
 * Initialize tooltips for icons
 */
function initializeTooltips() {
  const icons = document.querySelectorAll('.icon');
  icons.forEach(icon => {
    icon.addEventListener('mouseenter', function() {
      const label = this.getAttribute('aria-label');
      if (label && !this.querySelector('.tooltip')) {
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.textContent = label;
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: nowrap;
          pointer-events: none;
          margin-bottom: 5px;
        `;
        this.style.position = 'relative';
        this.appendChild(tooltip);
      }
    });
    
    icon.addEventListener('mouseleave', function() {
      const tooltip = this.querySelector('.tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
  });
}

// ========================================
// Utility Functions
// ========================================

/**
 * Smooth scroll to element
 * @param {string} elementId - ID of element to scroll to
 */
function smoothScrollTo(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Copy email to clipboard
 * @param {string} email - Email address to copy
 */
function copyEmail(email) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(email).then(() => {
      showNotification('Email copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy email:', err);
    });
  }
}

/**
 * Show a temporary notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, duration = 3000) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(76, 175, 80, 0.95);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    font-weight: 500;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// ========================================
// Performance Optimization
// ========================================

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ========================================
// Initialize on DOM Load
// ========================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Export functions for global use
window.showSection = showSection;
window.smoothScrollTo = smoothScrollTo;
window.copyEmail = copyEmail;

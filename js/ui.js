// UI helper functions and utilities

/**
 * Close modal by ID with proper cleanup
 * @param {string} modalId - The ID of the modal to close
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
        modal.classList.remove('active')
        modal.setAttribute('aria-hidden', 'true')
        
        // Remove focus trap and restore focus to body
        modal.removeAttribute('tabindex')
        document.body.focus()
        
        console.log(`Modal ${modalId} closed`)
    } else {
        console.warn(`Modal with ID ${modalId} not found`)
    }
}

/**
 * Open modal by ID with proper setup
 * @param {string} modalId - The ID of the modal to open
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
        modal.classList.add('active')
        modal.setAttribute('aria-hidden', 'false')
        
        // Set up focus trap
        modal.setAttribute('tabindex', '-1')
        modal.focus()
        
        console.log(`Modal ${modalId} opened`)
    } else {
        console.warn(`Modal with ID ${modalId} not found`)
    }
}

/**
 * Show notification with enhanced styling and management
 * @param {string} message - The notification message
 * @param {string} type - The notification type (info, success, warning, error)
 * @param {number} duration - How long to show the notification in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notificationContainer')
    if (!container) {
        console.warn('Notification container not found')
        return
    }
    
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    
    // Add icon based on type
    const icons = {
        info: 'â„¹ï¸',
        success: 'âœ…',
        warning: 'âš ï¸',
        error: 'âŒ'
    }
    
    const icon = icons[type] || 'â„¹ï¸'
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()" aria-label="Close notification">Ã—</button>
        </div>
    `
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        border-left: 4px solid ${getNotificationColor(type)};
        color: #333;
        font-family: var(--font-family, system-ui);
    `
    
    container.appendChild(notification)
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)'
    }, 100)
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)'
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove()
                }
            }, 300)
        }
    }, duration)
    
    console.log(`Notification shown: ${type} - ${message}`)
}

/**
 * Get color for notification type
 * @param {string} type - The notification type
 * @returns {string} CSS color value
 */
function getNotificationColor(type) {
    const colors = {
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336'
    }
    return colors[type] || colors.info
}

/**
 * Update screen reader announcements
 * @param {string} message - The message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
function announceToScreenReader(message, priority = 'polite') {
    const element = priority === 'assertive' 
        ? document.getElementById('gameAlerts')
        : document.getElementById('gameStatus')
    
    if (element) {
        element.textContent = message
        console.log(`Screen reader announcement (${priority}): ${message}`)
    } else {
        console.warn('Screen reader announcement element not found')
    }
}

/**
 * Show loading overlay
 * @param {string} message - Optional loading message
 */
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay')
    if (overlay) {
        const messageEl = overlay.querySelector('div:last-child')
        if (messageEl) {
            messageEl.textContent = message
        }
        overlay.style.display = 'flex'
        overlay.classList.add('active')
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay')
    if (overlay) {
        overlay.classList.remove('active')
        setTimeout(() => {
            overlay.style.display = 'none'
        }, 300)
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Debounce function to limit rapid calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Check if element is visible in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} True if visible
 */
function isElementVisible(element) {
    if (!element) return false
    
    const rect = element.getBoundingClientRect()
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
}

/**
 * Smooth scroll to element
 * @param {string|Element} target - Element or selector to scroll to
 * @param {number} offset - Offset from top in pixels
 */
function scrollToElement(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target
    if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
        })
    }
}

/**
 * Create and trigger a custom event
 * @param {string} eventName - Name of the event
 * @param {Object} detail - Event detail data
 * @param {Element} target - Target element (defaults to document)
 */
function triggerCustomEvent(eventName, detail = {}, target = document) {
    const event = new CustomEvent(eventName, {
        detail: detail,
        bubbles: true,
        cancelable: true
    })
    target.dispatchEvent(event)
    console.log(`Custom event triggered: ${eventName}`, detail)
}

/**
 * Get element's computed style property
 * @param {Element} element - The element
 * @param {string} property - CSS property name
 * @returns {string} Computed style value
 */
function getComputedStyleProperty(element, property) {
    if (!element) return ''
    return window.getComputedStyle(element).getPropertyValue(property)
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text)
            showNotification('Copied to clipboard!', 'success', 2000)
            return true
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            textArea.style.top = '-999999px'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            
            const success = document.execCommand('copy')
            textArea.remove()
            
            if (success) {
                showNotification('Copied to clipboard!', 'success', 2000)
            } else {
                showNotification('Failed to copy to clipboard', 'error', 3000)
            }
            return success
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        showNotification('Failed to copy to clipboard', 'error', 3000)
        return false
    }
}

// Make functions global
window.closeModal = closeModal
window.openModal = openModal
window.showNotification = showNotification
window.announceToScreenReader = announceToScreenReader
window.showLoading = showLoading
window.hideLoading = hideLoading
window.escapeHtml = escapeHtml
window.formatTime = formatTime
window.debounce = debounce
window.isElementVisible = isElementVisible
window.scrollToElement = scrollToElement
window.triggerCustomEvent = triggerCustomEvent
window.getComputedStyleProperty = getComputedStyleProperty
window.copyToClipboard = copyToClipboard

console.log('UI utilities loaded and ready')
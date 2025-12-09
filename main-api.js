/**
 * MedGuardian - API Client
 * Connects frontend to MongoDB backend via Express API
 */

const API_URL = window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : '/api';

// ============================================
// API Client Class
// ============================================
class APIClient {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

const api = new APIClient();

// ============================================
// Authentication Manager (Updated for API)
// ============================================
class AuthManager {
    static async register(email, password, userData) {
        try {
            const result = await api.post('/auth/register', {
                email,
                password,
                ...userData
            });

            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async login(email, password) {
        try {
            const result = await api.post('/auth/login', { email, password });

            // Store token and user info
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('currentUser', email);
            localStorage.setItem('userId', result.user.id);
            localStorage.setItem('isLoggedIn', 'true');

            api.token = result.token;

            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userId');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }

    static getCurrentUser() {
        return localStorage.getItem('currentUser');
    }

    static getUserId() {
        return localStorage.getItem('userId');
    }

    static isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    static requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    static async getUserProfile() {
        try {
            const email = this.getCurrentUser();
            const result = await api.get(`/auth/profile/${email}`);
            return result.user;
        } catch (error) {
            console.error('Failed to get user profile:', error);
            return null;
        }
    }
}

// ============================================
// Medication Manager (Updated for API)
// ============================================
class MedicationManager {
    static async addMedication(medicationData) {
        const userId = AuthManager.getUserId();
        return await api.post('/medications', {
            ...medicationData,
            userId
        });
    }

    static async getUserMedications() {
        const userId = AuthManager.getUserId();
        const result = await api.get(`/medications/${userId}`);
        return result.medications;
    }

    static async updateMedication(medication) {
        await api.put(`/medications/${medication._id}`, medication);
        return medication;
    }

    static async deleteMedication(id) {
        return await api.delete(`/medications/${id}`);
    }

    static async getMedication(id) {
        const medications = await this.getUserMedications();
        return medications.find(m => m._id === id);
    }
}

// ============================================
// Intake Tracker (Updated for API)
// ============================================
class IntakeTracker {
    static async recordIntake(medicationId, photoBase64 = null) {
        const userId = AuthManager.getUserId();

        const result = await api.post('/intake', {
            userId,
            medicationId,
            photo: photoBase64
        });

        return result.record._id;
    }

    static async getUserIntakeRecords(startDate = null, endDate = null) {
        const userId = AuthManager.getUserId();
        let url = `/intake/${userId}`;

        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }

        const result = await api.get(url);
        return result.records;
    }

    static async getAdherenceStats(days = 7) {
        const userId = AuthManager.getUserId();
        const result = await api.get(`/intake/${userId}/stats?days=${days}`);
        return result.stats;
    }
}

// ============================================
// Family Manager (Updated for API)
// ============================================
class FamilyManager {
    static async addFamilyMember(memberData) {
        const userId = AuthManager.getUserId();
        const result = await api.post('/family', {
            ...memberData,
            userId
        });
        return result.member._id;
    }

    static async getFamilyMembers() {
        const userId = AuthManager.getUserId();
        const result = await api.get(`/family/${userId}`);
        return result.members;
    }

    static async updateFamilyMember(member) {
        await api.put(`/family/${member._id}`, member);
        return member;
    }

    static async deleteFamilyMember(id) {
        return await api.delete(`/family/${id}`);
    }
}

// ============================================
// Notification Manager (Updated for API)
// ============================================
class NotificationManager {
    static async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    static async showNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%235793f7"/></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%2378c85c"/></svg>',
                ...options
            });
        }
    }

    static scheduleReminder(medicationName, time) {
        const now = new Date();
        const [hours, minutes] = time.split(':');
        const scheduledTime = new Date();
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0);

        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime - now;

        setTimeout(() => {
            this.showNotification('Medication Reminder', {
                body: `Time to take ${medicationName}`,
                tag: `med-${medicationName}`,
                requireInteraction: true
            });
        }, delay);

        return scheduledTime;
    }

    static async getNotifications() {
        const userId = AuthManager.getUserId();
        const result = await api.get(`/notifications/${userId}`);
        return result.notifications;
    }
}

// ============================================
// Utility Functions
// ============================================
const Utils = {
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatDateTime(dateString) {
        return `${this.formatDate(dateString)} at ${this.formatTime(dateString)}`;
    },

    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} fade-in`;
        alertDiv.textContent = message;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.opacity = '0';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }
};

// Export for use in other scripts
window.MedGuardian = {
    api,
    AuthManager,
    MedicationManager,
    IntakeTracker,
    FamilyManager,
    NotificationManager,
    Utils
};

// Check API connection on load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log('✅ API Connection:', data.message);
        console.log('📊 MongoDB Status:', data.mongodb);
    } catch (error) {
        console.warn('⚠️ API not available. Using offline mode.');
        console.error(error);
    }
});

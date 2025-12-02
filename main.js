/**
 * MedGuardian - Main JavaScript
 * Core utilities for data management, notifications, and authentication
 */

// ============================================
// Database Manager (IndexedDB)
// ============================================
const DB_NAME = 'MedGuardianDB';
const DB_VERSION = 1;

class DatabaseManager {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Users store
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'email' });
                    userStore.createIndex('email', 'email', { unique: true });
                }

                // Medications store
                if (!db.objectStoreNames.contains('medications')) {
                    const medStore = db.createObjectStore('medications', { keyPath: 'id', autoIncrement: true });
                    medStore.createIndex('userId', 'userId', { unique: false });
                }

                // Intake records store (with photos)
                if (!db.objectStoreNames.contains('intakeRecords')) {
                    const intakeStore = db.createObjectStore('intakeRecords', { keyPath: 'id', autoIncrement: true });
                    intakeStore.createIndex('medicationId', 'medicationId', { unique: false });
                    intakeStore.createIndex('userId', 'userId', { unique: false });
                    intakeStore.createIndex('date', 'date', { unique: false });
                }

                // Family members store
                if (!db.objectStoreNames.contains('familyMembers')) {
                    const familyStore = db.createObjectStore('familyMembers', { keyPath: 'id', autoIncrement: true });
                    familyStore.createIndex('userId', 'userId', { unique: false });
                }

                // Notifications store
                if (!db.objectStoreNames.contains('notifications')) {
                    const notifStore = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
                    notifStore.createIndex('userId', 'userId', { unique: false });
                    notifStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    async add(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        return new Promise((resolve, reject) => {
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Global database instance
const db = new DatabaseManager();

// ============================================
// Authentication Manager
// ============================================
class AuthManager {
    static async register(email, password, userData) {
        try {
            // Check if user already exists
            const existingUser = await db.get('users', email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Create user object
            const user = {
                email,
                password: btoa(password), // Simple encoding (use proper hashing in production)
                ...userData,
                createdAt: new Date().toISOString()
            };

            await db.add('users', user);
            return { success: true, user: { email, ...userData } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async login(email, password) {
        try {
            const user = await db.get('users', email);
            if (!user) {
                throw new Error('User not found');
            }

            if (atob(user.password) !== password) {
                throw new Error('Invalid password');
            }

            // Store session
            localStorage.setItem('currentUser', email);
            localStorage.setItem('isLoggedIn', 'true');

            return { success: true, user: { email, name: user.name } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }

    static getCurrentUser() {
        return localStorage.getItem('currentUser');
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
}

// ============================================
// Medication Manager
// ============================================
class MedicationManager {
    static async addMedication(medicationData) {
        const userId = AuthManager.getCurrentUser();
        const medication = {
            ...medicationData,
            userId,
            createdAt: new Date().toISOString()
        };
        return await db.add('medications', medication);
    }

    static async getUserMedications() {
        const userId = AuthManager.getCurrentUser();
        return await db.getByIndex('medications', 'userId', userId);
    }

    static async updateMedication(medication) {
        return await db.update('medications', medication);
    }

    static async deleteMedication(id) {
        return await db.delete('medications', id);
    }

    static async getMedication(id) {
        return await db.get('medications', id);
    }
}

// ============================================
// Intake Tracker
// ============================================
class IntakeTracker {
    static async recordIntake(medicationId, photoBase64 = null) {
        const userId = AuthManager.getCurrentUser();
        const now = new Date();
        
        const record = {
            medicationId,
            userId,
            timestamp: now.toISOString(),
            date: now.toISOString().split('T')[0], // YYYY-MM-DD
            photo: photoBase64,
            status: 'taken'
        };

        const recordId = await db.add('intakeRecords', record);
        
        // Notify family members
        await this.notifyFamily(medicationId, 'taken');
        
        return recordId;
    }

    static async getUserIntakeRecords(startDate = null, endDate = null) {
        const userId = AuthManager.getCurrentUser();
        const records = await db.getByIndex('intakeRecords', 'userId', userId);
        
        if (startDate && endDate) {
            return records.filter(r => r.date >= startDate && r.date <= endDate);
        }
        
        return records;
    }

    static async getAdherenceStats(days = 7) {
        const userId = AuthManager.getCurrentUser();
        const medications = await MedicationManager.getUserMedications();
        const records = await this.getUserIntakeRecords();
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        let totalExpected = 0;
        let totalTaken = 0;
        
        medications.forEach(med => {
            // Calculate expected doses based on frequency
            const dailyDoses = this.calculateDailyDoses(med.frequency);
            totalExpected += dailyDoses * days;
        });
        
        totalTaken = records.filter(r => {
            const recordDate = new Date(r.date);
            return recordDate >= startDate && recordDate <= endDate;
        }).length;
        
        const adherenceRate = totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;
        
        return {
            totalExpected,
            totalTaken,
            adherenceRate,
            days
        };
    }

    static calculateDailyDoses(frequency) {
        // Parse frequency string (e.g., "2 times daily", "once daily", "3 times daily")
        const match = frequency.toLowerCase().match(/(\d+)/);
        return match ? parseInt(match[1]) : 1;
    }

    static async notifyFamily(medicationId, status) {
        const medication = await MedicationManager.getMedication(medicationId);
        const familyMembers = await FamilyManager.getFamilyMembers();
        
        familyMembers.forEach(async (member) => {
            const notification = {
                userId: AuthManager.getCurrentUser(),
                familyMemberId: member.id,
                medicationName: medication.name,
                status,
                timestamp: new Date().toISOString(),
                message: `${medication.name} was ${status} at ${new Date().toLocaleTimeString()}`
            };
            
            await db.add('notifications', notification);
        });
    }
}

// ============================================
// Family Manager
// ============================================
class FamilyManager {
    static async addFamilyMember(memberData) {
        const userId = AuthManager.getCurrentUser();
        const member = {
            ...memberData,
            userId,
            createdAt: new Date().toISOString()
        };
        return await db.add('familyMembers', member);
    }

    static async getFamilyMembers() {
        const userId = AuthManager.getCurrentUser();
        return await db.getByIndex('familyMembers', 'userId', userId);
    }

    static async updateFamilyMember(member) {
        return await db.update('familyMembers', member);
    }

    static async deleteFamilyMember(id) {
        return await db.delete('familyMembers', id);
    }
}

// ============================================
// Notification Manager
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
        const userId = AuthManager.getCurrentUser();
        return await db.getByIndex('notifications', 'userId', userId);
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
    },

    debounce(func, wait) {
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
};

// ============================================
// Initialize Database on Load
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await db.init();
        console.log('MedGuardian database initialized');
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
});

// Export for use in other scripts
window.MedGuardian = {
    db,
    AuthManager,
    MedicationManager,
    IntakeTracker,
    FamilyManager,
    NotificationManager,
    Utils
};

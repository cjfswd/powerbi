import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define the 5 mock users and their passwords
const MOCK_USERS: Record<string, string> = {
    'rai.oliveira': 'Rai@2025',
    'mariana.freire': 'Mari!2025',
    'marcos.paulo': 'Marcos#2025',
    'rudson.rafael': 'Rudson$2025',
    'jocelino.lopes': 'Joce%2025'
};

interface AuthContextType {
    user: string | null;
    login: (username: string, pass: string) => boolean;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('powerbi_dashboard_auth_user');
            if (storedUser && MOCK_USERS[storedUser]) {
                setUser(storedUser);
            } else if (storedUser) {
                // If somehow invalid user stored, clear it
                localStorage.removeItem('powerbi_dashboard_auth_user');
            }
        } catch (e) {
            console.warn("Could not read from local storage", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (username: string, pass: string) => {
        const trimmedUser = username.trim().toLowerCase();

        // Check if user exists and password matches
        if (MOCK_USERS[trimmedUser] === pass) {
            setUser(trimmedUser);
            try {
                localStorage.setItem('powerbi_dashboard_auth_user', trimmedUser);
            } catch (e) {
                console.warn("Could not write to local storage", e);
            }
            return true;
        }

        return false; // Authentication failed
    };

    const logout = () => {
        setUser(null);
        try {
            localStorage.removeItem('powerbi_dashboard_auth_user');
        } catch (e) {
            console.warn("Could not remove from local storage", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

import { create } from 'zustand';
// Removed unused import 'persist'
import { StateCreator } from 'zustand';

interface User {
  id: string;
  username: string;
  password: string; // In a real app, this should be hashed
  createdAt: Date;
  country?: string; // Added country field
}

interface UserState {
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  registerUser: (username: string, password: string) => { success: boolean; message: string };
  loginUser: (username: string, password: string) => { success: boolean; message: string };
  logoutUser: () => void;
  deleteUser: (userId: string) => void;
}

export const useUserStore = create<UserState>((set) => {
  // Load saved users from localStorage on initialization
  const savedUsers = localStorage.getItem('keySystem_users');
  const initialUsers = savedUsers ? JSON.parse(savedUsers) : [];
  
  // Convert date strings back to Date objects
  initialUsers.forEach((user: User) => {
    if (typeof user.createdAt === 'string') {
      user.createdAt = new Date(user.createdAt);
    }
  });
  
  return {
    users: initialUsers,
    currentUser: null,
    isAuthenticated: false,
  
    registerUser: (username: string, password: string) => {
      // Start result object
      let result = { success: false, message: '' };

      set((state: UserState) => {
        // Check if username already exists
        const userExists = state.users.some(user => user.username === username);

        if (userExists) {
          result = { success: false, message: 'Username already exists' };
          return {}; // Return empty object to avoid unnecessary updates
        }

        // Create new user
        const newUser = {
          id: crypto.randomUUID(), // Or use a library for better compatibility
          username,
          password, // In a real app, this should be hashed
          createdAt: new Date(),
        };

        const updatedUsers = [...state.users, newUser];
        
        // Save users to localStorage
        localStorage.setItem('keySystem_users', JSON.stringify(updatedUsers));
        
        // Set the state with updated values
        result = { success: true, message: 'Registration successful' };
        
        return {
          users: updatedUsers,
          currentUser: newUser,
          isAuthenticated: true,
        };
      });

      return result; // Return result after the set call
    },
  
    loginUser: (username: string, password: string) => {
      // Start result object
      let result = { success: false, message: '' };

      set((state: UserState) => {
        // Find user by username and password
        const user = state.users.find(
          (user: User) => user.username === username && user.password === password
        );

        if (!user) {
          result = { success: false, message: 'Invalid username or password' };
          return {}; // Return empty object to avoid unnecessary updates
        }

        result = { success: true, message: 'Login successful' };

        // Set currentUser to logged-in user
        return {
          currentUser: user,
          isAuthenticated: true,
        };
      });

      return result; // Return result after the set call
    },
  
    logoutUser: () => set({ currentUser: null, isAuthenticated: false }),

    deleteUser: (userId: string) => set((state: UserState) => {
      const updatedUsers = state.users.filter(user => user.id !== userId);
      localStorage.setItem('keySystem_users', JSON.stringify(updatedUsers));
      const isDeletingCurrentUser = state.currentUser?.id === userId;
      return {
        users: updatedUsers,
        currentUser: isDeletingCurrentUser ? null : state.currentUser,
        isAuthenticated: isDeletingCurrentUser ? false : state.isAuthenticated,
      };
    }),
  };
});

import { Alert } from 'react-native';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import { useAuth } from '@/features/auth/context/AuthContext';
import { renderWithProviders } from '../__mocks__/utils/test-utils';

// Mock the hooks and dependencies
jest.mock('@/features/auth/context/AuthContext');
jest.mock('@/features/auth/components/AuthLayout', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

// Mock navigation object
const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
  canGoBack: jest.fn(() => false),
  reset: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
};

const mockRoute = {
  key: 'Login',
  name: 'Login' as const,
  params: undefined,
};

// Type the mocked functions
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginScreen Component Tests', () => {
  // Setup default mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();

    // Default auth mock
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      login: jest.fn().mockResolvedValue(undefined),
      register: jest.fn(),
      logout: jest.fn(),
      refreshAuth: jest.fn(),
      updateUser: jest.fn(),
    });
  });

  // TEST 1: Rendering Test - Check if all important UI elements render correctly
  test('1. Renders all important UI elements correctly', async () => {
    const { findByText, getByText, getByPlaceholderText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation as any} route={mockRoute} />
    );

    await findByText('Welcome Back');

    // Check if header text renders
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to continue exploring')).toBeTruthy();

    // Check if form labels render
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();

    // Check if input placeholders render
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();

    // Check if buttons and links render
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Forgot password?')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('or continue with')).toBeTruthy();
    expect(getByText('Google')).toBeTruthy();
  });

  // TEST 2: User Interaction Test - Test typing in inputs and clearing errors
  // test('2. User can type in email and password inputs, and errors clear on input', async () => {
  //   const { getByPlaceholderText, queryByText } = render(
  //     <LoginScreen navigation={mockNavigation as any} route={mockRoute} />
  //   );

  //   const emailInput = getByPlaceholderText('Enter your email');
  //   const passwordInput = getByPlaceholderText('Enter your password');

  //   // Type in email input
  //   fireEvent.changeText(emailInput, 'test@example.com');
  //   expect(emailInput.props.value).toBe('test@example.com');

  //   // Type in password input
  //   fireEvent.changeText(passwordInput, 'password123');
  //   expect(passwordInput.props.value).toBe('password123');

  //   // Simulate validation error first
  //   fireEvent.changeText(emailInput, '');
  //   fireEvent.press(
  //     getByPlaceholderText('Enter your password').parent?.parent?.parent ||
  //       getByPlaceholderText('Enter your password')
  //   );

  //   // Then type again - error should clear (we can't easily test this without triggering validation,
  //   // but we can verify the input value changes)
  //   fireEvent.changeText(emailInput, 'new@example.com');
  //   expect(emailInput.props.value).toBe('new@example.com');
  // });

  // TEST 3: Form Validation Test - Test email and password validation errors
  // test('3. Shows validation errors for invalid email and password', async () => {
  //   const { getByText, getByPlaceholderText, queryByText } = render(
  //     <LoginScreen navigation={mockNavigation as any} route={mockRoute} />
  //   );

  //   const signInButton = getByText('Sign In');

  //   // Try to submit with empty fields
  //   fireEvent.press(signInButton);

  //   await waitFor(() => {
  //     expect(getByText('Email is required')).toBeTruthy();
  //     expect(getByText('Password is required')).toBeTruthy();
  //   });

  //   // Test invalid email format
  //   const emailInput = getByPlaceholderText('Enter your email');
  //   fireEvent.changeText(emailInput, 'invalid-email');
  //   fireEvent.press(signInButton);

  //   await waitFor(() => {
  //     expect(getByText('Please enter a valid email address')).toBeTruthy();
  //   });

  //   // Test password too short
  //   const passwordInput = getByPlaceholderText('Enter your password');
  //   fireEvent.changeText(emailInput, 'valid@email.com');
  //   fireEvent.changeText(passwordInput, '12345'); // Less than 6 characters
  //   fireEvent.press(signInButton);

  //   await waitFor(() => {
  //     expect(getByText('Password must be at least 6 characters')).toBeTruthy();
  //   });
  // });

  // TEST 4: Async/Authentication Test - Test successful login and error handling
  // test('4. Handles successful login and navigates to Main screen', async () => {
  //   const mockLogin = jest.fn().mockResolvedValue(undefined);
  //   mockUseAuth.mockReturnValue({
  //     user: null,
  //     token: null,
  //     refreshToken: null,
  //     isAuthenticated: false,
  //     isLoading: false,
  //     isInitialized: true,
  //     login: mockLogin,
  //     register: jest.fn(),
  //     logout: jest.fn(),
  //     refreshAuth: jest.fn(),
  //     updateUser: jest.fn(),
  //   });

  //   const { getByText, getByPlaceholderText } = render(
  //     <LoginScreen navigation={mockNavigation as any} route={mockRoute} />
  //   );

  //   // Fill in valid credentials
  //   const emailInput = getByPlaceholderText('Enter your email');
  //   const passwordInput = getByPlaceholderText('Enter your password');
  //   const signInButton = getByText('Sign In');

  //   fireEvent.changeText(emailInput, 'user@example.com');
  //   fireEvent.changeText(passwordInput, 'password123');
  //   fireEvent.press(signInButton);

  //   // Wait for login to be called
  //   await waitFor(() => {
  //     expect(mockLogin).toHaveBeenCalledWith({
  //       email: 'user@example.com',
  //       password: 'password123',
  //     });
  //   });

  //   // Check if navigation.replace was called with correct parameters
  //   await waitFor(() => {
  //     expect(mockNavigation.replace).toHaveBeenCalledWith('Main', {
  //       screen: 'Tabs',
  //       params: { screen: 'Home' },
  //     });
  //   });
  // });

  // test('4b. Handles login error and shows alert', async () => {
  //   const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
  //   const alertSpy = jest
  //     .spyOn(require('react-native').Alert, 'alert')
  //     .mockImplementation(jest.fn());

  //   mockUseAuth.mockReturnValue({
  //     user: null,
  //     token: null,
  //     refreshToken: null,
  //     isAuthenticated: false,
  //     isLoading: false,
  //     isInitialized: true,
  //     login: mockLogin,
  //     register: jest.fn(),
  //     logout: jest.fn(),
  //     refreshAuth: jest.fn(),
  //     updateUser: jest.fn(),
  //   });

  //   const { getByText, getByPlaceholderText } = render(
  //     <LoginScreen navigation={mockNavigation as any} route={mockRoute} />
  //   );

  //   const emailInput = getByPlaceholderText('Enter your email');
  //   const passwordInput = getByPlaceholderText('Enter your password');
  //   const signInButton = getByText('Sign In');

  //   fireEvent.changeText(emailInput, 'user@example.com');
  //   fireEvent.changeText(passwordInput, 'wrongpassword');
  //   fireEvent.press(signInButton);

  //   // Wait for login to fail
  //   await waitFor(() => {
  //     expect(mockLogin).toHaveBeenCalled();
  //   });

  //   await waitFor(() => {
  //     expect(alertSpy).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
  //   });

  //   // Verify navigation was NOT called on error
  //   expect(mockNavigation.replace).not.toHaveBeenCalled();
  // });

  // TEST 5: Navigation Test - Test navigation to other screens (Forgot Password, Register)
  // test('5. Navigation links work correctly (Forgot Password and Register)', () => {
  //   const { getByText } = render(
  //     <LoginScreen navigation={mockNavigation as any} route={mockRoute} />
  //   );

  //   // Note: AppLink components will handle navigation internally
  //   // We can verify the links are rendered and clickable
  //   const forgotPasswordLink = getByText('Forgot password?');
  //   const signUpLink = getByText('Sign Up');

  //   expect(forgotPasswordLink).toBeTruthy();
  //   expect(signUpLink).toBeTruthy();

  //   // Test Google login button shows alert
  //   const googleButton = getByText('Google');
  //   fireEvent.press(googleButton);

  //   expect(Alert.alert).toHaveBeenCalledWith(
  //     'Coming Soon',
  //     'Google sign-in will be available soon.'
  //   );
  // });

  // BONUS TEST: Loading State Test - Test that button is disabled during loading
  // test('6. Sign In button is disabled when isLoading is true', () => {
  //   mockUseAuth.mockReturnValue({
  //     user: null,
  //     token: null,
  //     refreshToken: null,
  //     isAuthenticated: false,
  //     isLoading: true, // Loading state
  //     isInitialized: true,
  //     login: jest.fn(),
  //     register: jest.fn(),
  //     logout: jest.fn(),
  //     refreshAuth: jest.fn(),
  //     updateUser: jest.fn(),
  //   });

  //   const { getByText } = render(
  //     <LoginScreen navigation={mockNavigation as any} route={mockRoute} />
  //   );

  //   const signInButton = getByText('Sign In');

  //   // The button should be disabled (we can check the parent button component)
  //   // Note: The actual disabled state depends on your Button component implementation
  //   // This test verifies the component renders correctly in loading state
  //   expect(signInButton).toBeTruthy();
  // });
});

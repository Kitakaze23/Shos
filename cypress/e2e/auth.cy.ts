describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should redirect to signin when not authenticated', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/auth/signin')
  })

  it('should display signin page', () => {
    cy.visit('/auth/signin')
    cy.contains('Sign in').should('be.visible')
    cy.get('[data-testid="email-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
  })

  it('should show validation errors for invalid email', () => {
    cy.visit('/auth/signin')
    cy.get('[data-testid="email-input"]').type('invalid-email')
    cy.get('[data-testid="password-input"]').type('password')
    cy.get('[data-testid="submit-button"]').click()
    cy.contains('Invalid email').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.visit('/auth/signin')
    cy.get('[data-testid="email-input"]').type('wrong@example.com')
    cy.get('[data-testid="password-input"]').type('wrongpassword')
    cy.get('[data-testid="submit-button"]').click()
    cy.contains('Invalid').should('be.visible')
  })

  it('should navigate to signup page', () => {
    cy.visit('/auth/signin')
    cy.get('a[href="/auth/signup"]').click()
    cy.url().should('include', '/auth/signup')
    cy.contains('Sign up').should('be.visible')
  })

  it('should navigate to forgot password', () => {
    cy.visit('/auth/signin')
    cy.get('a[href="/auth/forgot-password"]').click()
    cy.url().should('include', '/auth/forgot-password')
    cy.contains('Reset password').should('be.visible')
  })
})

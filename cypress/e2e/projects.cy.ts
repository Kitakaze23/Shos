describe('Project Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'Password123')
  })

  it('should display projects list', () => {
    cy.visit('/dashboard/projects')
    cy.contains('Projects').should('be.visible')
    cy.get('[data-testid="create-project-button"]').should('be.visible')
  })

  it('should create a new project', () => {
    cy.visit('/dashboard/projects')
    cy.get('[data-testid="create-project-button"]').click()
    
    // Fill project form
    cy.get('[data-testid="project-name-input"]').type('Test Project')
    cy.get('[data-testid="project-description-input"]').type('Test Description')
    
    // Submit form
    cy.get('[data-testid="submit-button"]').click()
    
    // Verify project was created
    cy.contains('Test Project').should('be.visible')
  })

  it('should open project details', () => {
    cy.visit('/dashboard/projects')
    
    // Assuming there's at least one project
    cy.get('[data-testid="project-card"]').first().click()
    
    // Verify we're on project detail page
    cy.url().should('include', '/dashboard/projects/')
    cy.contains('Financial Dashboard').should('be.visible')
  })

  it('should display project tabs', () => {
    cy.visit('/dashboard/projects')
    cy.get('[data-testid="project-card"]').first().click()
    
    // Check for main tabs
    cy.contains('Financial Dashboard').should('be.visible')
    cy.contains('Equipment').should('be.visible')
    cy.contains('Operating Parameters').should('be.visible')
    cy.contains('Team Members').should('be.visible')
  })

  it('should navigate to project settings', () => {
    cy.visit('/dashboard/projects')
    cy.get('[data-testid="project-card"]').first().click()
    
    // Navigate to settings
    cy.get('a[href*="/settings"]').click()
    cy.url().should('include', '/settings')
    cy.contains('Project Settings').should('be.visible')
  })
})

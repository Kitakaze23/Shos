describe('Equipment Management', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'Password123')
    cy.visit('/dashboard/projects')
    cy.get('[data-testid="project-card"]').first().click()
    cy.contains('Equipment').click()
  })

  it('should display equipment list', () => {
    cy.contains('Equipment & Assets').should('be.visible')
    cy.get('[data-testid="add-equipment-button"]').should('be.visible')
  })

  it('should open add equipment dialog', () => {
    cy.get('[data-testid="add-equipment-button"]').click()
    cy.contains('Add Equipment').should('be.visible')
    cy.get('[data-testid="equipment-name-input"]').should('be.visible')
  })

  it('should validate equipment form', () => {
    cy.get('[data-testid="add-equipment-button"]').click()
    
    // Try to submit empty form
    cy.get('[data-testid="submit-button"]').click()
    
    // Should show validation errors
    cy.contains('required').should('be.visible')
  })

  it('should add new equipment', () => {
    cy.get('[data-testid="add-equipment-button"]').click()
    
    // Fill equipment form
    cy.get('[data-testid="equipment-name-input"]').type('Test Helicopter')
    cy.get('[data-testid="equipment-category-select"]').click()
    cy.contains('Helicopter').click()
    cy.get('[data-testid="equipment-price-input"]').type('10000000')
    cy.get('[data-testid="equipment-service-life-input"]').type('10')
    
    // Submit
    cy.get('[data-testid="submit-button"]').click()
    
    // Verify equipment was added
    cy.contains('Test Helicopter').should('be.visible')
  })
})

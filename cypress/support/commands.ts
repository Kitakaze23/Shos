/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      createProject(name: string, description?: string): Chainable<void>
      waitForApi(alias: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    email,
    () => {
      cy.visit('/auth/signin')
      cy.get('[data-testid="email-input"]').type(email)
      cy.get('[data-testid="password-input"]').type(password)
      cy.get('[data-testid="submit-button"]').click()
      cy.url().should('include', '/dashboard')
    },
    {
      validate: () => {
        cy.getCookie('next-auth.session-token').should('exist')
      },
    }
  )
})

Cypress.Commands.add('logout', () => {
  cy.visit('/dashboard/profile')
  cy.get('[data-testid="sign-out-button"]').click()
  cy.url().should('include', '/auth/signin')
})

Cypress.Commands.add('createProject', (name: string, description?: string) => {
  cy.visit('/dashboard/projects')
  cy.get('[data-testid="create-project-button"]').click()
  cy.get('[data-testid="project-name-input"]').type(name)
  if (description) {
    cy.get('[data-testid="project-description-input"]').type(description)
  }
  cy.get('[data-testid="submit-button"]').click()
  cy.contains('Project created').should('be.visible')
})

Cypress.Commands.add('waitForApi', (alias: string) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response?.statusCode).to.be.oneOf([200, 201])
  })
})

export {}

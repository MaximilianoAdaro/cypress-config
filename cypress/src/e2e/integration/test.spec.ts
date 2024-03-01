describe('template spec', () => {
    it('1. passes', () => {
        cy.visit('https://example.cypress.io')
    })

    it('2. fails', () => {
        cy.visit('https://example.cypress.io')
        expect(true).to.equal(false)
    })

    it('3. passes', () => {
        cy.visit('https://example.cypress.io')
    })
})
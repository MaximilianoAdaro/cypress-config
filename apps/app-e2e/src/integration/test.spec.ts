describe('test template spec', () => {
    it('1. test passes', () => {
        cy.visit('https://example.cypress.io')
    })

    it('2. test fails', () => {
        cy.visit('https://example.cypress.io')
        expect(true).to.equal(false)
    })

    it('3. test passes', () => {
        cy.visit('https://example.cypress.io')
    })
})
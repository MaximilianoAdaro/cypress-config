describe('template spec', () => {
  it('fails', () => {
    cy.visit('https://example.cypress.io')
    expect(true).to.equal(false)
  })
})
describe('test 3 template spec', () => {

    it('automatically redirects to Google SSO auth if query param is passed', () => {
        cy.visit(`/login?sso=google-oauth2`);
        cy.origin(`https://accounts.google.com/`, () => {
            // Note: below assertions are fine. We want to test if the user is redirected to Google SSO and the CORS error page of Google verifies that.
            cy.contains(`403. That’s an error.`).should('be.visible');
            cy.contains(
                `We're sorry, but you do not have access to this page. That’s all we know.`
            ).should('be.visible');
        });
        // Maxi: we need to visit this page to reset the URL to the default one, otherwise it randomly fails in the after:each
        // cy.visit('/');
    });

    it('1. test fails', () => {
        expect(true).to.equal(false)
    })

    it('2. test passes', () => {
        expect(true).to.equal(true)
    })

    it('3. test passes', () => {
        expect(true).to.equal(true)
    })
})
describe('The Home Page', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:3000')

    cy.get('h1').should('contain', 'Join A Room')
  })
})
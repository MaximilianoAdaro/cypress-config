describe('test 4 template spec', () => {
    afterEach(() => {
        console.log('CONSOLE: afterEach test 4');
        throw new Error('after each error test 4')
    })

    it('1. test passes', () => {
        expect(true).to.equal(true)
    })

    it('2. test fails', () => {
        expect(true).to.equal(false)
    })

    it('3. test passes', () => {
        expect(true).to.equal(true)
    })
})
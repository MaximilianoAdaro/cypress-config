describe('test 1 template spec', () => {
    afterEach(() => {
        console.log('CONSOLE: afterEach test 1');
        throw new Error('after each error test 1')
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
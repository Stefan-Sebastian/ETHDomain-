const { ethers } = require('hardhat')
const { expect } = require ('chai')

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('ETHDaddy contract', () => {
	let ethDaddy, tx, resulT

	const NAME = 'ETH Daddy'
	const SYMBOL = 'ETHD'

	beforeEach(async () => {

		[owner, buyer, unauthorizedAddr] = await ethers.getSigners()

		//Fetch contract to deploy..
		const ETHDaddy = await ethers.getContractFactory('ETHDaddy')
		ethDaddy = await ETHDaddy.deploy(NAME, SYMBOL)
	})

	describe('Deployment', () => {

		it('returns the name', async () => {
			expect(await ethDaddy.name()).to.equal(NAME)

		})

		it('returns teh symbol', async () => {
			expect(await ethDaddy.symbol()).to.equal(SYMBOL)
		})

		it('returns the owner', async () => {
			expect(await ethDaddy.owner()).to.equal(owner.address)
		})

	})

	describe('Listing domain', () => {
		
		describe('Success', () => {
			beforeEach(async() => {

				//Fetch the transaction..
				tx = await ethDaddy.connect(owner).list('jack.eth', tokens(10))
				result = await tx.wait()
			})

			it('updates max supply', async () => {
				expect(await ethDaddy.maxSupply()).to.equal(1)
			})

		})

		describe('Failure', () => {
			
			it('should fail owner does not call the function', async () => {
				await expect(ethDaddy.connect(unauthorizedAddr).list('jack.eth', tokens(10))).to.be.reverted
			})
		})
	})

	describe('Minting', () => {
		let domainID = 1

		beforeEach(async () => {
			//list the domain
			tx = await ethDaddy.connect(owner).list('jack.eth', tokens(10))
			result = await tx.wait()
		})

		describe('Success', () => {

			beforeEach(async () => {
				

				//Mint the domain..
				tx = await ethDaddy.connect(buyer).mint(domainID, { value: tokens(10) })
				result = await tx.wait()
			})

			it('updates domain ownership', async() => {
				expect(await ethDaddy.ownerOf(domainID)).to.equal(buyer.address)
			})

			it('updates domain status', async() => {
				const domain = await ethDaddy.getDomain(domainID)
				expect(domain.isOwned).to.equal(true)
			})

			it('updates the total supply', async () => {
				expect(await ethDaddy.totalSupply()).to.equal(1)
			})

			it('updates the contract balance', async () => {
				expect(await ethDaddy.getBalance()).to.equal(tokens(10))
			})

			})

		describe('Failure', () => {
			
			it('should fail if domain id is 0', async () => {
				const invalidID = 0
				await expect(ethDaddy.connect(buyer).mint(invalidID, { value: tokens(10) })).to.be.reverted
			})

			it('should fail if domain id was not listed', async () => {
				const invalidId = 2
				await expect(ethDaddy.connect(buyer).mint(invalidId, { value: tokens(10) })).to.be.reverted
			})

			it('should fail if the domain is owned', async () => {
				tx = await ethDaddy.connect(unauthorizedAddr).mint(domainID, { value: tokens(10) })
				result = await tx.wait()

				await expect(ethDaddy.connect(buyer).mint(domainID, { value: tokens(10) })).to.be.reverted
			})

			it('should fail if there are not sufficient funds', async () => {
				const invalidAmount = tokens(0)
				await expect(ethDaddy.connect(buyer).mint(domainID, { value: invalidAmount })).to.be.reverted
			})
		})

	})

	describe('Withdaw funds', () => {

		describe('Success', () => {

		beforeEach(async() => {
			//Withdraw funds..
			tx = await ethDaddy.connect(owner).withdraw()
			result = await tx.wait()
		})

		it('updates contract balance', async () =>{
			const balance = await ethDaddy.getBalance()
			expect(balance).to.equal(0)
		})
		
		})

		describe('Failure', () => {
			
			it('should fail if unauthorized account withdraws funds', async() => {
				await expect(ethDaddy.connect(unauthorizedAddr).withdraw()).to.be.reverted
			})
		})

	})

})














# && lcov --remove lcov.info '/test/fuzz/*' -o lcov.info 
# && python ./clean_coverage_report.py
# forge coverage --mp "test/unit/*" --report lcov && genhtml lcov.info --branch-coverage --output-dir coverage
# forge verify-contract $(address) $(contract) --chain-id $(chain_id) --watch --constructor-args $(CONSTRUCTOR_ARGS) --etherscan-api-key $(ETHERSCAN_API_KEY)
# ifneq ($(constructor_signature),)
# 	VERIFY_COMMAND := $(contract_address) $(contract) --chain-id $(chain_id) --watch --constructor-args $(shell cast abi-encode $(constructor_signature) $(input_parameters))
# else
# 	VERIFY_COMMAND := $(contract_address) $(contract) --chain-id $(chain_id) --watch
# endif
# forge verify-contract $(VERIFY_COMMAND)
# if [ -n "$(constructor_signature)" ]; then \
# 	constructor_args_encoded=$$(cast abi-encode $(constructor_signature) $(input_parameters)); \
# 	verify_command="forge verify-contract $(contract_address) $(contract) --chain-id $(chain_id) --watch --constructor-args $$constructor_args_encoded"; \
# else \
# 	verify_command="forge verify-contract $(contract_address) $(contract) --chain-id $(chain_id) --watch"; \
# fi; \
# \
# $$verify_command


-include .env

ifeq ($(network),sepolia)
	NETWORK_ARGS := --rpc-url $(SEPOLIA_RPC_URL) --broadcast --verify -vvvv 
	CHAIN_ID := 11155111	
endif

ifeq ($(network),holesky)
	NETWORK_ARGS := --rpc-url $(ETHEREUM_HOLESKY_RPC) $(EXPLORER_API_KEY) --broadcast --verify -vvvv --gas-estimate-multiplier 300
	CHAIN_ID := 17000
endif

ifeq ($(network),amoy)
	EXPLORER_API_KEY := --etherscan-api-key $(POLYGONSCAN_API_KEY) --verifier-url https://api-amoy.polygonscan.com/api
	NETWORK_ARGS := --rpc-url $(AMOY_RPC_URL) $(EXPLORER_API_KEY) --gas-estimate-multiplier 200 --broadcast --verify -vvvv
	CHAIN_ID := 80002
endif

ifeq ($(network),polygon)
	EXPLORER_API_KEY := --etherscan-api-key $(POLYGONSCAN_API_KEY) --verifier-url https://api.polygonscan.com/api
	NETWORK_ARGS := --rpc-url $(POLYGON_RPC_URL) $(EXPLORER_API_KEY) --broadcast --verify -vvvv 
	CHAIN_ID := 137	
endif

ifneq ($(constructor_signature),)
	CONSTRUCTOR_COMMAND := $(shell cast abi-encode "$(constructor_signature)" $(input_parameters))
	VERIFY_COMMAND := $(contract_address) $(contract) --chain-id $(CHAIN_ID) --constructor-args $(CONSTRUCTOR_COMMAND) $(EXPLORER_API_KEY) --watch
else
	VERIFY_COMMAND := $(contract_address) $(contract) --chain-id $(CHAIN_ID) $(EXPLORER_API_KEY) --watch
endif 


run_testSepolia:;
	@forge test --fork-url $(SEPOLIA_RPC_URL) -vvvv

run_testAmoy:;
	@forge test --fork-url $(AMOY_RPC_URL) -vvvv

run_coverage:;
	@forge coverage --mp "test/unit/*" --report lcov

coverage_report:;
	@genhtml lcov.info --branch-coverage --output-dir coverage

deploy:;
	@forge script script/Deploy.s.sol $(NETWORK_ARGS)

verify:;	
	forge verify-contract $(VERIFY_COMMAND)

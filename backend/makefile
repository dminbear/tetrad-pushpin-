run:
	docker-compose -f ./docker-config/docker-compose-development.yml build
	docker-compose -f ./docker-config/docker-compose-development.yml up

sudorun:
	sudo docker-compose -f ./docker-config/docker-compose-development.yml build
	sudo docker-compose -f ./docker-config/docker-compose-development.yml up

test:
	docker-compose -f ./docker-config/docker-compose-test.yml build
	docker-compose -f ./docker-config/docker-compose-test.yml up

test-only:
	docker-compose -f ./docker-config/docker-compose-test.yml up

clean:
	docker-compose -f ./docker-config/docker-compose-development.yml down --volume
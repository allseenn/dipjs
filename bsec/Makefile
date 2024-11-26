TARGET=bsec
ARG=-I/usr/local/include/hiredis -L/usr/local/lib -lhiredis -lm -lrt -static -std=c99 -pedantic

all: ${TARGET}

${TARGET}: ${TARGET}.o bsec_integration.o bme680.o libalgobsec.a 
	gcc ${ARG} -o ${TARGET} ${TARGET}.o bsec_integration.o bme680.o libalgobsec.a 
	
bsec_integration.o:
	gcc ${ARG} -o bsec_integration.o -c bsec_integration.c
	
bme680.o:
	gcc ${ARG} -o bme680.o -c bme680.c

${TARGET}.o: ${TARGET}.c
	gcc ${ARG} -o ${TARGET}.o -c ${TARGET}.c 

install:
	chmod 777 ${TARGET}
	sudo cp ${TARGET} bsec_iaq.csv bsec_iaq.config bsec_iaq.state /usr/local/sbin
	
clean:
	rm -rf *.o ${TARGET}


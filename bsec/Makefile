TARGET=bsec
ARG=-lm -lrt -lhiredis -static -std=c99 -pedantic -I/usr/include/hiredis -L/usr/lib -D_FILE_OFFSET_BITS=64

all: ${TARGET}

${TARGET}: ${TARGET}.o bsec_integration.o bme680.o libalgobsec.a 
	gcc ${ARG} -o ${TARGET} ${TARGET}.o bsec_integration.o bme680.o libalgobsec.a 
	
bsec_integration.o:
	gcc -o bsec_integration.o -c bsec_integration.c
	
bme680.o:
	gcc -o bme680.o -c bme680.c

${TARGET}.o: ${TARGET}.c
	gcc -I/usr/include/hiredis -L/usr/lib -D_FILE_OFFSET_BITS=64 -o ${TARGET}.o -c ${TARGET}.c 

install:
	chmod 777 ${TARGET}
	sudo cp ${TARGET} bsec_iaq.csv bsec_iaq.config bsec_iaq.state /usr/local/sbin
	
clean:
	rm -rf *.o ${TARGET}


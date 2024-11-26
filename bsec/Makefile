TARGET=bsec
ARG=-lm -lrt  -std=c99 -pedantic -I/usr/include/hiredis /usr/lib/libhiredis.so -D_FILE_OFFSET_BITS=64  -lhiredis

all: ${TARGET}

${TARGET}: ${TARGET}.o bsec_integration.o bme680.o libalgobsec.a 
	gcc ${ARG} -o ${TARGET} ${TARGET}.o bsec_integration.o bme680.o libalgobsec.a 
	
bsec_integration.o:
	gcc -o bsec_integration.o -c bsec_integration.c
	
bme680.o:
	gcc -o bme680.o -c bme680.c

${TARGET}.o: ${TARGET}.c
	gcc ${ARG} -o ${TARGET}.o -c ${TARGET}.c 

install:
	chmod 777 ${TARGET}
	sudo cp ${TARGET} ${TARGET}.sh ${TARGET}_iaq.csv ${TARGET}_iaq.config ${TARGET}_iaq.state rad.sh /usr/local/sbin
	
clean:
	rm -rf *.o ${TARGET}


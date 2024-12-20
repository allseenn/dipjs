#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <fcntl.h>
#include <string.h>
#include <unistd.h>
#include <inttypes.h>
#include <sys/ioctl.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <linux/i2c-dev.h>
#include <hiredis.h>
#include "bsec_integration.h"
#define DESTZONE "TZ=Europe/Moscow"
#define temp_offset (2.4f)
#define sample_rate_mode (BSEC_SAMPLE_RATE_LP)

int g_i2cFid; // I2C Linux device handle
int i2c_address = BME680_I2C_ADDR_PRIMARY;
char *filename_state = "/usr/local/sbin/bsec_iaq.state";
char *filename_config = "/usr/local/sbin/bsec_iaq.config";
float hectoPascal = 0.750063755419211;
int once = 0; // Variable to indicate if -o flag is set

void i2cOpen()
{
    g_i2cFid = open("/dev/i2c-1", O_RDWR);
    if (g_i2cFid < 0) {
        perror("i2cOpen");
        exit(1);
    }
}

void i2cClose()
{
    close(g_i2cFid);
}

void i2cSetAddress(int address)
{
    if (ioctl(g_i2cFid, I2C_SLAVE, address) < 0) {
        perror("i2cSetAddress");
        exit(1);
    }
}

int8_t bus_write(uint8_t dev_addr, uint8_t reg_addr, uint8_t *reg_data_ptr,
                 uint16_t data_len)
{
    int8_t rslt = 0; 
    uint8_t reg[16];
    reg[0] = reg_addr;
    int i;
    for (i = 1; i < data_len + 1; i++)
        reg[i] = reg_data_ptr[i - 1];

    if (write(g_i2cFid, reg, data_len + 1) != data_len + 1) {
        perror("user_i2c_write");
        rslt = 1;
        exit(1);
    }
    return rslt;
}

int8_t bus_read(uint8_t dev_addr, uint8_t reg_addr, uint8_t *reg_data_ptr,
                uint16_t data_len)
{
    int8_t rslt = 0; 
    uint8_t reg[1];
    reg[0] = reg_addr;

    if (write(g_i2cFid, reg, 1) != 1) {
        perror("user_i2c_read_reg");
        rslt = 1;
    }
    if (read(g_i2cFid, reg_data_ptr, data_len) != data_len) {
        perror("user_i2c_read_data");
        rslt = 1;
    }
    return rslt;
}

void _sleep(uint32_t t_ms)
{
    struct timespec ts;
    ts.tv_sec = t_ms / 1000;
    ts.tv_nsec = (t_ms % 1000) * 1000000L;
    nanosleep(&ts, NULL);
}

int64_t get_timestamp_us()
{
    struct timespec spec;
    clock_gettime(CLOCK_MONOTONIC, &spec);
    int64_t system_current_time_ns = (int64_t)(spec.tv_sec) * (int64_t)1000000000
                                     + (int64_t)(spec.tv_nsec);
    int64_t system_current_time_us = system_current_time_ns / 1000;
    return system_current_time_us;
}


void output_ready(int64_t timestamp, float iaq, uint8_t iaq_accuracy,
                  float temperature, float humidity, float pressure,
                  float raw_temperature, float raw_humidity, float gas,
                  bsec_library_return_t bsec_status,
                  float static_iaq, float co2_equivalent,
                  float breath_voc_equivalent)
{
 

    // int byte1;
    // FILE *fp = popen("i2cget -y 1 0x66 0x03", "r");
    // fscanf(fp, "%2x", &byte1);
    // pclose(fp);
    // int byte2;
    // fp = popen("i2cget -y 1 0x66 0x04", "r");
    // fscanf(fp, "%2x", &byte2);
    // pclose(fp);
    // int byte3;
    // fp = popen("i2cget -y 1 0x66 0x05", "r");
    // fscanf(fp, "%2x", &byte3);
    // pclose(fp);
    // uint32_t value = (byte1 << 16) | (byte2 << 8) | byte3;
    // float rad_dyn = (float)value / 10.0f;

    // byte1;
    // fp = popen("i2cget -y 1 0x66 0x06", "r");
    // fscanf(fp, "%2x", &byte1);
    // pclose(fp);
    // byte2;
    // fp = popen("i2cget -y 1 0x66 0x07", "r");
    // fscanf(fp, "%2x", &byte2);
    // pclose(fp);
    // byte3;
    // fp = popen("i2cget -y 1 0x66 0x08", "r");
    // fscanf(fp, "%2x", &byte3);
    // pclose(fp);
    // value = (byte1 << 16) | (byte2 << 8) | byte3;
    // float rad_stat = (float)value / 10.0f;
    float rad_dyn;
    float rad_stat;
    FILE *fp = popen("rad.sh", "r");
    fscanf(fp, "%f %f", &rad_dyn, &rad_stat);
    pclose(fp);

    time_t t = time(NULL);
    float pressure_hpa = pressure / 100 * hectoPascal;
    float gas_ohms = gas / 1000;

    redisContext *c = redisConnect("127.0.0.1", 6379);
    redisCommand(c, "DEL 0");
    redisCommand(c, "RPUSH 0 %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %d %d %.1f %.0f", temperature, raw_temperature, humidity, raw_humidity, pressure_hpa, gas_ohms, co2_equivalent, breath_voc_equivalent, iaq, static_iaq, iaq_accuracy, bsec_status, rad_dyn, rad_stat);
    redisCommand(c, "RPUSH %lu %.2f %.2f %.2f %.2f %.2f %.2f %.0f %.2f %.2f %.2f %d %d %.1f %.0f", t, temperature, raw_temperature, humidity, raw_humidity, pressure_hpa, gas_ohms, co2_equivalent, breath_voc_equivalent, iaq, static_iaq, iaq_accuracy, bsec_status, rad_dyn, rad_stat);
    redisFree(c);

    if (once) {
        //printf("%lu", (unsigned long)t);
        printf("%.2f ", temperature); /* Celsius */
        printf("%.2f ", raw_temperature); /* Celsius */
        printf("%.2f ", humidity); /* % */
        printf("%.2f ", raw_humidity); /* % */
        printf("%.2f ", pressure / 100 * hectoPascal); /* hPa */
        printf("%.2f ", gas/1000); /* КOms */
        printf("%.0f ", co2_equivalent); // eCO2 ppm
        printf("%.2f ", breath_voc_equivalent); //bVOCe ppm]
        printf("%.2f ", iaq); // IAQ
        printf("%.2f ", static_iaq); // static IAQ
        printf("%d ", iaq_accuracy); // IAQ accuracy
        printf("%d ", bsec_status);
        printf("%.1f ", rad_dyn); // IAQ accuracy
        printf("%.0f", rad_stat);
        printf("\r\n");
        fflush(stdout);
    }
}

uint32_t binary_load(uint8_t *b_buffer, uint32_t n_buffer, char *filename,
                     uint32_t offset)
{
    int32_t copied_bytes = 0;
    int8_t rslt = 0;
    struct stat fileinfo;
    rslt = stat(filename, &fileinfo);
    if (rslt != 0) {
        fprintf(stderr,"stat'ing binary file %s: ",filename);
        perror("");
        return 0;
    }

    uint32_t filesize = fileinfo.st_size - offset;
    if (filesize > n_buffer) {
        fprintf(stderr,"%s: %d > %d\n", "binary data bigger than buffer", filesize,
                n_buffer);
        return 0;
    } else {
        FILE *file_ptr;
        file_ptr = fopen(filename,"rb");
        if (!file_ptr) {
            perror("fopen");
            return 0;
        }
        fseek(file_ptr, offset, SEEK_SET);
        copied_bytes = fread(b_buffer, sizeof(char), filesize, file_ptr);
        if (copied_bytes == 0) {
            fprintf(stderr, "%s empty\n", filename);
        }
        fclose(file_ptr);
        return copied_bytes;
    }
}

uint32_t state_load(uint8_t *state_buffer, uint32_t n_buffer)
{
    int32_t rslt = 0;
    rslt = binary_load(state_buffer, n_buffer, filename_state, 0);
    return rslt;
}

void state_save(const uint8_t *state_buffer, uint32_t length)
{
    FILE *state_w_ptr;
    state_w_ptr = fopen(filename_state, "wb");
    fwrite(state_buffer, length, 1, state_w_ptr);
    fclose(state_w_ptr);
}

uint32_t config_load(uint8_t *config_buffer, uint32_t n_buffer)
{
    int32_t rslt = 0;
    rslt = binary_load(config_buffer, n_buffer, filename_config, 4);
    return rslt;
}

int main(int argc, char* argv[])
{
    putenv(DESTZONE); 
    int opt;
    while ((opt = getopt(argc, argv, "o")) != -1) {
        switch (opt) {
            case 'o':
                once = 1;
                break;
            default:
                fprintf(stderr, "Usage: %s [-o]\n", argv[0]);
                exit(EXIT_FAILURE);
        }
    }

    i2cOpen();
    i2cSetAddress(i2c_address);
    return_values_init ret;
    ret = bsec_iot_init(sample_rate_mode, temp_offset, bus_write, bus_read,
                        _sleep, state_load, config_load);
    if (ret.bme680_status) {
        return (int)ret.bme680_status;
    } else if (ret.bsec_status) {
        return (int)ret.bsec_status;
    }
    if (once) {
        bsec_iot_loop(_sleep, get_timestamp_us, output_ready, state_save, 1);
    } else {
        bsec_iot_loop(_sleep, get_timestamp_us, output_ready, state_save, 10000);
    }
    i2cClose();
    return 0;
}

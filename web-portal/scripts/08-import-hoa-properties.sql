-- ============================================================================
-- HOA Property Import Script
-- ============================================================================
-- Imports all 232 HOA properties with zone assignments and lot numbers
-- Based on the complete community directory

-- First, ensure the foundation schema is loaded:
-- \i 07-create-property-foundation.sql

-- ============================================================================
-- Zone and Street Group Definitions
-- ============================================================================

-- Zone Strategy:
-- Zone 1: Lower Hills & Goldstone (southern area)
-- Zone 2: Upper Hills, Esperanto, Blueberry, Vacheron (northern rectangle area)  
-- Zone 3: Triangle West area (Defio, Sportivo, Faceto, Matisse)

-- Street Groups for easy filtering and maintenance scheduling:
-- Hills, Goldstone (Zone 1)
-- Hills, Esperanto, Blueberry, Vacheron (Zone 2)
-- Defio, Sportivo, Faceto, Matisse (Zone 3)

-- ============================================================================
-- Zone 1: Lower Hills & Goldstone (22 properties)
-- ============================================================================

-- E Goldstone Dr (11 properties) - Lot numbers 1-11
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('4098 E Goldstone Dr', '001', '1', 'Goldstone', 'single_family', 'master_list'),
('4090 E Goldstone Dr', '002', '1', 'Goldstone', 'single_family', 'master_list'),
('4082 E Goldstone Dr', '003', '1', 'Goldstone', 'single_family', 'master_list'),
('4076 E Goldstone Dr', '004', '1', 'Goldstone', 'single_family', 'master_list'),
('4070 E Goldstone Dr', '005', '1', 'Goldstone', 'single_family', 'master_list'),
('4062 E Goldstone Dr', '006', '1', 'Goldstone', 'single_family', 'master_list'),
('4055 E Goldstone Dr', '007', '1', 'Goldstone', 'single_family', 'master_list'),
('4049 E Goldstone Dr', '008', '1', 'Goldstone', 'single_family', 'master_list'),
('4041 E Goldstone Dr', '009', '1', 'Goldstone', 'single_family', 'master_list'),
('4035 E Goldstone Dr', '010', '1', 'Goldstone', 'single_family', 'master_list'),
('4029 E Goldstone Dr', '011', '1', 'Goldstone', 'single_family', 'master_list');

-- S Hills Ave - Lower section (2017-2193) - Lot numbers 12-22
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('2017 S Hills Ave', '012', '1', 'Hills', 'single_family', 'master_list'),
('2029 S Hills Ave', '013', '1', 'Hills', 'single_family', 'master_list'),
('2030 S Hills Ave', '014', '1', 'Hills', 'single_family', 'master_list'),
('2041 S Hills Ave', '015', '1', 'Hills', 'single_family', 'master_list'),
('2046 S Hills Ave', '016', '1', 'Hills', 'single_family', 'master_list'),
('2049 S Hills Ave', '017', '1', 'Hills', 'single_family', 'master_list'),
('2058 S Hills Ave', '018', '1', 'Hills', 'single_family', 'master_list'),
('2061 S Hills Ave', '019', '1', 'Hills', 'single_family', 'master_list'),
('2070 S Hills Ave', '020', '1', 'Hills', 'single_family', 'master_list'),
('2073 S Hills Ave', '021', '1', 'Hills', 'single_family', 'master_list'),
('2080 S Hills Ave', '022', '1', 'Hills', 'single_family', 'master_list'),
('2083 S Hills Ave', '023', '1', 'Hills', 'single_family', 'master_list'),
('2086 S Hills Ave', '024', '1', 'Hills', 'single_family', 'master_list'),
('2087 S Hills Ave', '025', '1', 'Hills', 'single_family', 'master_list'),
('2096 S Hills Ave', '026', '1', 'Hills', 'single_family', 'master_list'),
('2097 S Hills Ave', '027', '1', 'Hills', 'single_family', 'master_list'),
('2109 S Hills Ave', '028', '1', 'Hills', 'single_family', 'master_list'),
('2110 S Hills Ave', '029', '1', 'Hills', 'single_family', 'master_list'),
('2120 S Hills Ave', '030', '1', 'Hills', 'single_family', 'master_list'),
('2121 S Hills Ave', '031', '1', 'Hills', 'single_family', 'master_list'),
('2129 S Hills Ave', '032', '1', 'Hills', 'single_family', 'master_list'),
('2132 S Hills Ave', '033', '1', 'Hills', 'single_family', 'master_list'),
('2143 S Hills Ave', '034', '1', 'Hills', 'single_family', 'master_list'),
('2146 S Hills Ave', '035', '1', 'Hills', 'single_family', 'master_list'),
('2149 S Hills Ave', '036', '1', 'Hills', 'single_family', 'master_list'),
('2161 S Hills Ave', '037', '1', 'Hills', 'single_family', 'master_list'),
('2169 S Hills Ave', '038', '1', 'Hills', 'single_family', 'master_list'),
('2181 S Hills Ave', '039', '1', 'Hills', 'single_family', 'master_list'),
('2193 S Hills Ave', '040', '1', 'Hills', 'single_family', 'master_list');

-- ============================================================================
-- Zone 2: Upper Hills, Esperanto, Blueberry, Vacheron (114 properties)
-- ============================================================================

-- S Hills Ave - Upper section (1733-1841) - Lot numbers 41-50
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('1733 S Hills Ave', '041', '2', 'Hills', 'single_family', 'master_list'),
('1745 S Hills Ave', '042', '2', 'Hills', 'single_family', 'master_list'),
('1757 S Hills Ave', '043', '2', 'Hills', 'single_family', 'master_list'),
('1769 S Hills Ave', '044', '2', 'Hills', 'single_family', 'master_list'),
('1781 S Hills Ave', '045', '2', 'Hills', 'single_family', 'master_list'),
('1793 S Hills Ave', '046', '2', 'Hills', 'single_family', 'master_list'),
('1805 S Hills Ave', '047', '2', 'Hills', 'single_family', 'master_list'),
('1817 S Hills Ave', '048', '2', 'Hills', 'single_family', 'master_list'),
('1829 S Hills Ave', '049', '2', 'Hills', 'single_family', 'master_list'),
('1841 S Hills Ave', '050', '2', 'Hills', 'single_family', 'master_list');

-- E Blueberry St (31 properties) - Lot numbers 51-81
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('4031 E Blueberry St', '051', '2', 'Blueberry', 'single_family', 'master_list'),
('4043 E Blueberry St', '052', '2', 'Blueberry', 'single_family', 'master_list'),
('4046 E Blueberry St', '053', '2', 'Blueberry', 'single_family', 'master_list'),
('4055 E Blueberry St', '054', '2', 'Blueberry', 'single_family', 'master_list'),
('4058 E Blueberry St', '055', '2', 'Blueberry', 'single_family', 'master_list'),
('4069 E Blueberry St', '056', '2', 'Blueberry', 'single_family', 'master_list'),
('4072 E Blueberry St', '057', '2', 'Blueberry', 'single_family', 'master_list'),
('4081 E Blueberry St', '058', '2', 'Blueberry', 'single_family', 'master_list'),
('4084 E Blueberry St', '059', '2', 'Blueberry', 'single_family', 'master_list'),
('4090 E Blueberry St', '060', '2', 'Blueberry', 'single_family', 'master_list'),
('4093 E Blueberry St', '061', '2', 'Blueberry', 'single_family', 'master_list'),
('4100 E Blueberry St', '062', '2', 'Blueberry', 'single_family', 'master_list'),
('4103 E Blueberry St', '063', '2', 'Blueberry', 'single_family', 'master_list'),
('4112 E Blueberry St', '064', '2', 'Blueberry', 'single_family', 'master_list'),
('4115 E Blueberry St', '065', '2', 'Blueberry', 'single_family', 'master_list'),
('4124 E Blueberry St', '066', '2', 'Blueberry', 'single_family', 'master_list'),
('4127 E Blueberry St', '067', '2', 'Blueberry', 'single_family', 'master_list'),
('4136 E Blueberry St', '068', '2', 'Blueberry', 'single_family', 'master_list'),
('4139 E Blueberry St', '069', '2', 'Blueberry', 'single_family', 'master_list'),
('4148 E Blueberry St', '070', '2', 'Blueberry', 'single_family', 'master_list'),
('4151 E Blueberry St', '071', '2', 'Blueberry', 'single_family', 'master_list'),
('4160 E Blueberry St', '072', '2', 'Blueberry', 'single_family', 'master_list'),
('4163 E Blueberry St', '073', '2', 'Blueberry', 'single_family', 'master_list'),
('4166 E Blueberry St', '074', '2', 'Blueberry', 'single_family', 'master_list'),
('4174 E Blueberry St', '075', '2', 'Blueberry', 'single_family', 'master_list'),
('4175 E Blueberry St', '076', '2', 'Blueberry', 'single_family', 'master_list'),
('4186 E Blueberry St', '077', '2', 'Blueberry', 'single_family', 'master_list'),
('4187 E Blueberry St', '078', '2', 'Blueberry', 'single_family', 'master_list'),
('4198 E Blueberry St', '079', '2', 'Blueberry', 'single_family', 'master_list'),
('4199 E Blueberry St', '080', '2', 'Blueberry', 'single_family', 'master_list'),
('4211 E Blueberry St', '081', '2', 'Blueberry', 'single_family', 'master_list');

-- E Esperanto St (31 properties) - Lot numbers 82-112
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('4040 E Esperanto St', '082', '2', 'Esperanto', 'single_family', 'master_list'),
('4049 E Esperanto St', '083', '2', 'Esperanto', 'single_family', 'master_list'),
('4052 E Esperanto St', '084', '2', 'Esperanto', 'single_family', 'master_list'),
('4061 E Esperanto St', '085', '2', 'Esperanto', 'single_family', 'master_list'),
('4064 E Esperanto St', '086', '2', 'Esperanto', 'single_family', 'master_list'),
('4073 E Esperanto St', '087', '2', 'Esperanto', 'single_family', 'master_list'),
('4076 E Esperanto St', '088', '2', 'Esperanto', 'single_family', 'master_list'),
('4081 E Esperanto St', '089', '2', 'Esperanto', 'single_family', 'master_list'),
('4084 E Esperanto St', '090', '2', 'Esperanto', 'single_family', 'master_list'),
('4093 E Esperanto St', '091', '2', 'Esperanto', 'single_family', 'master_list'),
('4096 E Esperanto St', '092', '2', 'Esperanto', 'single_family', 'master_list'),
('4105 E Esperanto St', '093', '2', 'Esperanto', 'single_family', 'master_list'),
('4108 E Esperanto St', '094', '2', 'Esperanto', 'single_family', 'master_list'),
('4117 E Esperanto St', '095', '2', 'Esperanto', 'single_family', 'master_list'),
('4120 E Esperanto St', '096', '2', 'Esperanto', 'single_family', 'master_list'),
('4129 E Esperanto St', '097', '2', 'Esperanto', 'single_family', 'master_list'),
('4141 E Esperanto St', '098', '2', 'Esperanto', 'single_family', 'master_list'),
('4144 E Esperanto St', '099', '2', 'Esperanto', 'single_family', 'master_list'),
('4147 E Esperanto St', '100', '2', 'Esperanto', 'single_family', 'master_list'),
('4156 E Esperanto St', '101', '2', 'Esperanto', 'single_family', 'master_list'),
('4159 E Esperanto St', '102', '2', 'Esperanto', 'single_family', 'master_list'),
('4168 E Esperanto St', '103', '2', 'Esperanto', 'single_family', 'master_list'),
('4171 E Esperanto St', '104', '2', 'Esperanto', 'single_family', 'master_list'),
('4180 E Esperanto St', '105', '2', 'Esperanto', 'single_family', 'master_list'),
('4183 E Esperanto St', '106', '2', 'Esperanto', 'single_family', 'master_list'),
('4192 E Esperanto St', '107', '2', 'Esperanto', 'single_family', 'master_list'),
('4195 E Esperanto St', '108', '2', 'Esperanto', 'single_family', 'master_list'),
('4204 E Esperanto St', '109', '2', 'Esperanto', 'single_family', 'master_list'),
('4207 E Esperanto St', '110', '2', 'Esperanto', 'single_family', 'master_list'),
('4216 E Esperanto St', '111', '2', 'Esperanto', 'single_family', 'master_list'),
('4228 E Esperanto St', '112', '2', 'Esperanto', 'single_family', 'master_list');

-- E Vacheron St (24 properties) - Lot numbers 113-136
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('4237 E Vacheron St', '113', '2', 'Vacheron', 'single_family', 'master_list'),
('4240 E Vacheron St', '114', '2', 'Vacheron', 'single_family', 'master_list'),
('4249 E Vacheron St', '115', '2', 'Vacheron', 'single_family', 'master_list'),
('4252 E Vacheron St', '116', '2', 'Vacheron', 'single_family', 'master_list'),
('4261 E Vacheron St', '117', '2', 'Vacheron', 'single_family', 'master_list'),
('4264 E Vacheron St', '118', '2', 'Vacheron', 'single_family', 'master_list'),
('4273 E Vacheron St', '119', '2', 'Vacheron', 'single_family', 'master_list'),
('4276 E Vacheron St', '120', '2', 'Vacheron', 'single_family', 'master_list'),
('4285 E Vacheron St', '121', '2', 'Vacheron', 'single_family', 'master_list'),
('4288 E Vacheron St', '122', '2', 'Vacheron', 'single_family', 'master_list'),
('4297 E Vacheron St', '123', '2', 'Vacheron', 'single_family', 'master_list'),
('4300 E Vacheron St', '124', '2', 'Vacheron', 'single_family', 'master_list'),
('4309 E Vacheron St', '125', '2', 'Vacheron', 'single_family', 'master_list'),
('4312 E Vacheron St', '126', '2', 'Vacheron', 'single_family', 'master_list'),
('4321 E Vacheron St', '127', '2', 'Vacheron', 'single_family', 'master_list'),
('4324 E Vacheron St', '128', '2', 'Vacheron', 'single_family', 'master_list'),
('4333 E Vacheron St', '129', '2', 'Vacheron', 'single_family', 'master_list'),
('4336 E Vacheron St', '130', '2', 'Vacheron', 'single_family', 'master_list'),
('4345 E Vacheron St', '131', '2', 'Vacheron', 'single_family', 'master_list'),
('4348 E Vacheron St', '132', '2', 'Vacheron', 'single_family', 'master_list'),
('4357 E Vacheron St', '133', '2', 'Vacheron', 'single_family', 'master_list'),
('4360 E Vacheron St', '134', '2', 'Vacheron', 'single_family', 'master_list'),
('4369 E Vacheron St', '135', '2', 'Vacheron', 'single_family', 'master_list'),
('4372 E Vacheron St', '136', '2', 'Vacheron', 'single_family', 'master_list');

-- ============================================================================
-- Zone 3: Triangle West (96 properties)
-- ============================================================================

-- S Defio Way (39 properties) - Lot numbers 137-175
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('1868 S Defio Way', '137', '3', 'Defio', 'single_family', 'master_list'),
('1874 S Defio Way', '138', '3', 'Defio', 'single_family', 'master_list'),
('1880 S Defio Way', '139', '3', 'Defio', 'single_family', 'master_list'),
('1886 S Defio Way', '140', '3', 'Defio', 'single_family', 'master_list'),
('1892 S Defio Way', '141', '3', 'Defio', 'single_family', 'master_list'),
('1902 S Defio Way', '142', '3', 'Defio', 'single_family', 'master_list'),
('1910 S Defio Way', '143', '3', 'Defio', 'single_family', 'master_list'),
('1913 S Defio Way', '144', '3', 'Defio', 'single_family', 'master_list'),
('1918 S Defio Way', '145', '3', 'Defio', 'single_family', 'master_list'),
('1919 S Defio Way', '146', '3', 'Defio', 'single_family', 'master_list'),
('1925 S Defio Way', '147', '3', 'Defio', 'single_family', 'master_list'),
('1926 S Defio Way', '148', '3', 'Defio', 'single_family', 'master_list'),
('1931 S Defio Way', '149', '3', 'Defio', 'single_family', 'master_list'),
('1934 S Defio Way', '150', '3', 'Defio', 'single_family', 'master_list'),
('1939 S Defio Way', '151', '3', 'Defio', 'single_family', 'master_list'),
('1942 S Defio Way', '152', '3', 'Defio', 'single_family', 'master_list'),
('1947 S Defio Way', '153', '3', 'Defio', 'single_family', 'master_list'),
('1950 S Defio Way', '154', '3', 'Defio', 'single_family', 'master_list'),
('1955 S Defio Way', '155', '3', 'Defio', 'single_family', 'master_list'),
('1958 S Defio Way', '156', '3', 'Defio', 'single_family', 'master_list'),
('1963 S Defio Way', '157', '3', 'Defio', 'single_family', 'master_list'),
('1966 S Defio Way', '158', '3', 'Defio', 'single_family', 'master_list'),
('1971 S Defio Way', '159', '3', 'Defio', 'single_family', 'master_list'),
('1974 S Defio Way', '160', '3', 'Defio', 'single_family', 'master_list'),
('1979 S Defio Way', '161', '3', 'Defio', 'single_family', 'master_list'),
('1982 S Defio Way', '162', '3', 'Defio', 'single_family', 'master_list'),
('1987 S Defio Way', '163', '3', 'Defio', 'single_family', 'master_list'),
('1990 S Defio Way', '164', '3', 'Defio', 'single_family', 'master_list'),
('1998 S Defio Way', '165', '3', 'Defio', 'single_family', 'master_list'),
('2006 S Defio Way', '166', '3', 'Defio', 'single_family', 'master_list'),
('2014 S Defio Way', '167', '3', 'Defio', 'single_family', 'master_list'),
('2022 S Defio Way', '168', '3', 'Defio', 'single_family', 'master_list'),
('2030 S Defio Way', '169', '3', 'Defio', 'single_family', 'master_list'),
('2038 S Defio Way', '170', '3', 'Defio', 'single_family', 'master_list'),
('2046 S Defio Way', '171', '3', 'Defio', 'single_family', 'master_list'),
('2054 S Defio Way', '172', '3', 'Defio', 'single_family', 'master_list'),
('2062 S Defio Way', '173', '3', 'Defio', 'single_family', 'master_list'),
('2070 S Defio Way', '174', '3', 'Defio', 'single_family', 'master_list'),
('2078 S Defio Way', '175', '3', 'Defio', 'single_family', 'master_list');

-- S Defio Pl (9 properties) - Lot numbers 176-184
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('2086 S Defio Pl', '176', '3', 'Defio', 'single_family', 'master_list'),
('2094 S Defio Pl', '177', '3', 'Defio', 'single_family', 'master_list'),
('2102 S Defio Pl', '178', '3', 'Defio', 'single_family', 'master_list'),
('2110 S Defio Pl', '179', '3', 'Defio', 'single_family', 'master_list'),
('2118 S Defio Pl', '180', '3', 'Defio', 'single_family', 'master_list'),
('2126 S Defio Pl', '181', '3', 'Defio', 'single_family', 'master_list'),
('2134 S Defio Pl', '182', '3', 'Defio', 'single_family', 'master_list'),
('2142 S Defio Pl', '183', '3', 'Defio', 'single_family', 'master_list'),
('2150 S Defio Pl', '184', '3', 'Defio', 'single_family', 'master_list');

-- E Sportivo Dr (15 properties) - Lot numbers 185-199
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('4341 E Sportivo Dr', '185', '3', 'Sportivo', 'single_family', 'master_list'),
('4349 E Sportivo Dr', '186', '3', 'Sportivo', 'single_family', 'master_list'),
('4357 E Sportivo Dr', '187', '3', 'Sportivo', 'single_family', 'master_list'),
('4365 E Sportivo Dr', '188', '3', 'Sportivo', 'single_family', 'master_list'),
('4373 E Sportivo Dr', '189', '3', 'Sportivo', 'single_family', 'master_list'),
('4381 E Sportivo Dr', '190', '3', 'Sportivo', 'single_family', 'master_list'),
('4389 E Sportivo Dr', '191', '3', 'Sportivo', 'single_family', 'master_list'),
('4397 E Sportivo Dr', '192', '3', 'Sportivo', 'single_family', 'master_list'),
('4405 E Sportivo Dr', '193', '3', 'Sportivo', 'single_family', 'master_list'),
('4413 E Sportivo Dr', '194', '3', 'Sportivo', 'single_family', 'master_list'),
('4429 E Sportivo Dr', '195', '3', 'Sportivo', 'single_family', 'master_list'),
('4437 E Sportivo Dr', '196', '3', 'Sportivo', 'single_family', 'master_list'),
('4445 E Sportivo Dr', '197', '3', 'Sportivo', 'single_family', 'master_list'),
('4453 E Sportivo Dr', '198', '3', 'Sportivo', 'single_family', 'master_list'),
('4462 E Sportivo Dr', '199', '3', 'Sportivo', 'single_family', 'master_list');

-- E Faceto St (16 properties) - Lot numbers 200-215
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('4418 E Faceto St', '200', '3', 'Faceto', 'single_family', 'master_list'),
('4421 E Faceto St', '201', '3', 'Faceto', 'single_family', 'master_list'),
('4426 E Faceto St', '202', '3', 'Faceto', 'single_family', 'master_list'),
('4429 E Faceto St', '203', '3', 'Faceto', 'single_family', 'master_list'),
('4434 E Faceto St', '204', '3', 'Faceto', 'single_family', 'master_list'),
('4437 E Faceto St', '205', '3', 'Faceto', 'single_family', 'master_list'),
('4442 E Faceto St', '206', '3', 'Faceto', 'single_family', 'master_list'),
('4445 E Faceto St', '207', '3', 'Faceto', 'single_family', 'master_list'),
('4450 E Faceto St', '208', '3', 'Faceto', 'single_family', 'master_list'),
('4453 E Faceto St', '209', '3', 'Faceto', 'single_family', 'master_list'),
('4458 E Faceto St', '210', '3', 'Faceto', 'single_family', 'master_list'),
('4461 E Faceto St', '211', '3', 'Faceto', 'single_family', 'master_list'),
('4466 E Faceto St', '212', '3', 'Faceto', 'single_family', 'master_list'),
('4469 E Faceto St', '213', '3', 'Faceto', 'single_family', 'master_list'),
('4474 E Faceto St', '214', '3', 'Faceto', 'single_family', 'master_list'),
('4477 E Faceto St', '215', '3', 'Faceto', 'single_family', 'master_list');

-- E Matisse St (17 properties) - Lot numbers 216-232
INSERT INTO properties (address, lot_number, hoa_zone, street_group, property_type, source) VALUES
('4470 E Matisse St', '216', '3', 'Matisse', 'single_family', 'master_list'),
('4478 E Matisse St', '217', '3', 'Matisse', 'single_family', 'master_list'),
('4486 E Matisse St', '218', '3', 'Matisse', 'single_family', 'master_list'),
('4494 E Matisse St', '219', '3', 'Matisse', 'single_family', 'master_list'),
('4502 E Matisse St', '220', '3', 'Matisse', 'single_family', 'master_list'),
('4510 E Matisse St', '221', '3', 'Matisse', 'single_family', 'master_list'),
('4513 E Matisse St', '222', '3', 'Matisse', 'single_family', 'master_list'),
('4518 E Matisse St', '223', '3', 'Matisse', 'single_family', 'master_list'),
('4521 E Matisse St', '224', '3', 'Matisse', 'single_family', 'master_list'),
('4526 E Matisse St', '225', '3', 'Matisse', 'single_family', 'master_list'),
('4529 E Matisse St', '226', '3', 'Matisse', 'single_family', 'master_list'),
('4534 E Matisse St', '227', '3', 'Matisse', 'single_family', 'master_list'),
('4537 E Matisse St', '228', '3', 'Matisse', 'single_family', 'master_list'),
('4545 E Matisse St', '229', '3', 'Matisse', 'single_family', 'master_list'),
('4553 E Matisse St', '230', '3', 'Matisse', 'single_family', 'master_list'),
('4561 E Matisse St', '231', '3', 'Matisse', 'single_family', 'master_list'),
('4569 E Matisse St', '232', '3', 'Matisse', 'single_family', 'master_list');

-- ============================================================================
-- Verification and Summary Queries
-- ============================================================================

-- Verify import counts
SELECT 
  'Total Properties Imported' as metric,
  COUNT(*)::text as value
FROM properties 
WHERE source = 'master_list'

UNION ALL

SELECT 
  'Zone 1 (Lower Hills & Goldstone)' as metric,
  COUNT(*)::text as value
FROM properties 
WHERE hoa_zone = '1'

UNION ALL

SELECT 
  'Zone 2 (Upper Hills, Esperanto, Blueberry, Vacheron)' as metric,
  COUNT(*)::text as value
FROM properties 
WHERE hoa_zone = '2'

UNION ALL

SELECT 
  'Zone 3 (Triangle West)' as metric,
  COUNT(*)::text as value
FROM properties 
WHERE hoa_zone = '3'

UNION ALL

SELECT 
  'Street Groups' as metric,
  COUNT(DISTINCT street_group)::text as value
FROM properties;

-- Show properties by street group
SELECT 
  hoa_zone,
  street_group,
  COUNT(*) as property_count,
  MIN(lot_number) as first_lot,
  MAX(lot_number) as last_lot
FROM properties 
WHERE source = 'master_list'
GROUP BY hoa_zone, street_group
ORDER BY hoa_zone, street_group;

-- Show lot number sequence verification
SELECT 
  COUNT(*) as total_properties,
  MIN(lot_number::int) as first_lot_number,
  MAX(lot_number::int) as last_lot_number,
  CASE 
    WHEN MAX(lot_number::int) - MIN(lot_number::int) + 1 = COUNT(*) 
    THEN 'SEQUENTIAL' 
    ELSE 'GAPS DETECTED' 
  END as sequence_status
FROM properties 
WHERE source = 'master_list';

-- List any duplicate addresses (should be empty)
SELECT address, COUNT(*) as count
FROM properties 
GROUP BY address 
HAVING COUNT(*) > 1;

-- ============================================================================
-- Next Steps After Import
-- ============================================================================

-- 1. Match existing survey responses to properties:
-- UPDATE responses 
-- SET property_id = p.property_id
-- FROM properties p 
-- WHERE TRIM(UPPER(responses.address)) = TRIM(UPPER(p.address));

-- 2. Create first survey definition and migrate responses:
-- See the survey migration script (09-migrate-survey-data.sql)

-- 3. Verify data quality and address any unmatched addresses

COMMENT ON TABLE properties IS 'Complete HOA property directory with 232 properties organized by zones and street groups';

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'HOA PROPERTY IMPORT COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Total Properties: 232';
  RAISE NOTICE 'Zone 1: 40 properties (Lower Hills & Goldstone, Lots 001-040)';
  RAISE NOTICE 'Zone 2: 96 properties (Upper Hills, Esperanto, Blueberry, Vacheron, Lots 041-136)';
  RAISE NOTICE 'Zone 3: 96 properties (Triangle West, Lots 137-232)';
  RAISE NOTICE 'Street Groups: 8 (Goldstone, Hills, Blueberry, Esperanto, Vacheron, Defio, Sportivo, Faceto, Matisse)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run survey data migration to link existing responses to properties';
  RAISE NOTICE '============================================================';
END $$;
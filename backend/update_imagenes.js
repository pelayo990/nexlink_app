const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imagenes = {
  'SAM-S24U-001': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
  'SAM-TV65-002': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400',
  'SAM-TAB-003': 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=400',
  'SAM-SB-004': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'SAM-MON-005': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  'SAM-NB-006': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
  'SAM-WCH-007': 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400',
  'SAM-BUD-008': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
  'SAM-REF-009': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400',
  'SAM-MIC-010': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400',

  'FAL-NF-001': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
  'FAL-ROOM-002': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  'FAL-NESP-003': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
  'FAL-NIK-004': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  'FAL-LIV-005': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
  'FAL-COL-006': 'https://images.unsplash.com/photo-1547452585-bb4e3a7c1c8c?w=400',
  'FAL-TER-007': 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400',
  'FAL-MAN-008': 'https://images.unsplash.com/photo-1604917877934-07d8d248d396?w=400',
  'FAL-DXR-009': 'https://images.unsplash.com/photo-1616627451515-cbc80e5ece6a?w=400',
  'FAL-NIN-010': 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400',

  'CEN-VIN-001': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
  'CEN-WEB-002': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
  'CEN-WUS-003': 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400',
  'CEN-JAM-004': 'https://images.unsplash.com/photo-1606851094851-66e90a9b9cd8?w=400',
  'CEN-QUE-005': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
  'CEN-WHI-006': 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
  'CEN-ACE-007': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
  'CEN-CHA-008': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
  'CEN-CAF-009': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
  'CEN-SAL-010': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',

  'LAT-UPG-001': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
  'LAT-INT-002': 'https://images.unsplash.com/photo-1540339832862-474599807836?w=400',
  'LAT-EQU-003': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
  'LAT-VIP-004': 'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=400',
  'LAT-MIL-005': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400',
  'LAT-SEG-006': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'LAT-FAM-007': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400',
  'LAT-MAL-008': 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400',
  'LAT-TRA-009': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
  'LAT-ALM-010': 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400',

  'BCH-AMZ-001': 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400',
  'BCH-NET-002': 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400',
  'BCH-BIC-003': 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400',
  'BCH-GYM-004': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  'BCH-KIN-005': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
  'BCH-DES-006': 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400',
  'BCH-APP-007': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
  'BCH-YOG-008': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
  'BCH-CAR-009': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
  'BCH-CAT-010': 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400',

  'ENT-RTR-001': 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400',
  'ENT-MOT-002': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
  'ENT-TAB-003': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400',
  'ENT-ECH-004': 'https://images.unsplash.com/photo-1512446816042-444d641267d4?w=400',
  'ENT-HDD-005': 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400',
  'ENT-CAM-006': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
  'ENT-IMP-007': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400',
  'ENT-TEC-008': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  'ENT-MOU-009': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  'ENT-WEB-010': 'https://images.unsplash.com/photo-1593152167544-085d3b9c4938?w=400',
};

async function main() {
  let count = 0;
  for (const [sku, imagen] of Object.entries(imagenes)) {
    const result = await prisma.producto.updateMany({ where: { sku }, data: { imagen } });
    count += result.count;
  }
  console.log('Imágenes actualizadas:', count);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

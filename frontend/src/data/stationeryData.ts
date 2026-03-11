// Mock data for stationery products

import butBi from '../assets/images/products/but-bi-thien-long-tl027.jpg';
import butChi from '../assets/images/products/but-chi-2b.png';
import butDaQuang from '../assets/images/products/but-da-quang-6-mau.jpg';
import butMau from '../assets/images/products/but-mau-24-cay.webp';
import compa from '../assets/images/products/compa-kim-loai.jpg';
import giayA4 from '../assets/images/products/giay-a4-70gsm.png';
import hopBut from '../assets/images/products/hop-but-canvas.png';
import keoCat from '../assets/images/products/keo-cat-van-phong.jpg';
import keoDan from '../assets/images/products/keo-dan.jpg';
import thuocKe from '../assets/images/products/thuoc-ke-30cm.jpg';
import voKe from '../assets/images/products/vo-ke-ngang-200-trang.jpg';
import voOly from '../assets/images/products/vo-o-ly-96-trang.jpg';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  weight: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const products: Product[] = [
  {
    id: 'P001',
    name: 'Bút bi Thiên Long TL-027',
    category: 'Bút viết',
    price: 5000,
    image: butBi,
    description: 'Bút bi chất lượng cao, mực xanh, viết trơn',
    stock: 150,
    weight: 0.01,
  },
  {
    id: 'P002',
    name: 'Bút chì 2B',
    category: 'Bút viết',
    price: 3000,
    image: butChi,
    description: 'Bút chì gỗ độ cứng 2B, phù hợp cho vẽ và viết',
    stock: 200,
    weight: 0.01,
  },
  {
    id: 'P003',
    name: 'Vở kẻ ngang 200 trang',
    category: 'Vở và sổ',
    price: 15000,
    image: voKe,
    description: 'Vở 200 trang, giấy trắng, kẻ ngang',
    stock: 100,
    weight: 0.2,
  },
  {
    id: 'P004',
    name: 'Vở ô ly 96 trang',
    category: 'Vở và sổ',
    price: 8000,
    image: voOly,
    description: 'Vở ô li vuông nhỏ, phù hợp cho toán học',
    stock: 120,
    weight: 0.15,
  },
  {
    id: 'P005',
    name: 'Bút dạ quang 6 màu',
    category: 'Bút viết',
    price: 25000,
    image: butDaQuang,
    description: 'Bộ 6 bút dạ quang màu sắc rực rỡ',
    stock: 80,
    weight: 0.08,
  },
  {
    id: 'P006',
    name: 'Thước kẻ nhựa 30cm',
    category: 'Dụng cụ học tập',
    price: 7000,
    image: thuocKe,
    description: 'Thước kẻ trong suốt, độ chính xác cao',
    stock: 90,
    weight: 0.03,
  },
  {
    id: 'P007',
    name: 'Bộ compa kim loại',
    category: 'Dụng cụ học tập',
    price: 35000,
    image: compa,
    description: 'Compa chuyên dụng cho học sinh, sinh viên',
    stock: 60,
    weight: 0.15,
  },
  {
    id: 'P008',
    name: 'Kéo cắt văn phòng',
    category: 'Dụng cụ văn phòng',
    price: 12000,
    image: keoCat,
    description: 'Kéo cắt sắc bén, tay cầm êm tay',
    stock: 75,
    weight: 0.1,
  },
  {
    id: 'P009',
    name: 'Hộp bút canvas',
    category: 'Túi và hộp',
    price: 45000,
    image: hopBut,
    description: 'Hộp bút vải canvas thời trang, nhiều ngăn',
    stock: 50,
    weight: 0.12,
  },
  {
    id: 'P010',
    name: 'Giấy A4 70gsm (1 ream)',
    category: 'Giấy in',
    price: 85000,
    image: giayA4,
    description: 'Giấy A4 trắng 500 tờ, độ trắng cao',
    stock: 40,
    weight: 2.5,
  },
  {
    id: 'P011',
    name: 'Bộ bút màu 24 cây',
    category: 'Bút viết',
    price: 55000,
    image: butMau,
    description: 'Bộ 24 màu cho vẽ và tô màu',
    stock: 65,
    weight: 0.2,
  },
  {
    id: 'P012',
    name: 'Keo dán UHU 40ml',
    category: 'Dụng cụ văn phòng',
    price: 18000,
    image: keoDan,
    description: 'Keo dán đa năng, khô nhanh',
    stock: 100,
    weight: 0.05,
  },
];

export const categories = [
  'Tất cả',
  'Bút viết',
  'Vở và sổ',
  'Dụng cụ học tập',
  'Dụng cụ văn phòng',
  'Túi và hộp',
  'Giấy in',
];
import React, { useState } from 'react';

const Order = () => {
  // Giả lập giỏ hàng có sẵn 1 sản phẩm để test
  const [cart, setCart] = useState([{ id: 1, name: 'Sách Toán lớp 10', price: 50000 }]); 
  const [order, setOrder] = useState(null); 
  const [history, setHistory] = useState([]); 

  // State cho thông tin giao hàng
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const createOrder = () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    const newOrder = {
      id: Date.now(),
      items: cart,
      shipping: shippingInfo, // Lưu thông tin người nhận vào đơn hàng
      status: 'pending',
      createdAt: new Date().toLocaleString(),
    };
    
    setOrder(newOrder);
    setHistory([...history, newOrder]);
    setCart([]); // Xóa giỏ hàng
  };

  const updateStatus = (newStatus) => {
    if (order) {
      const updatedOrder = { ...order, status: newStatus };
      setOrder(updatedOrder);
      // Cập nhật lại lịch sử
      setHistory(history.map((o) => (o.id === order.id ? updatedOrder : o)));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Giỏ hàng & Thanh toán</h1>
      
      {/* Form thông tin giao hàng */}
      {!order && cart.length > 0 && (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h3>Thông tin giao hàng</h3>
          <input type="text" name="name" placeholder="Họ và tên" onChange={handleInputChange} style={{ display: 'block', margin: '10px 0' }} />
          <input type="text" name="phone" placeholder="Số điện thoại" onChange={handleInputChange} style={{ display: 'block', margin: '10px 0' }} />
          <input type="text" name="address" placeholder="Địa chỉ giao hàng" onChange={handleInputChange} style={{ display: 'block', margin: '10px 0' }} />
          <button onClick={createOrder}>Xác nhận Tạo đơn hàng</button>
        </div>
      )}

      {/* Chi tiết đơn hàng hiện tại */}
      {order && (
        <div style={{ border: '2px solid green', padding: '15px', marginBottom: '20px' }}>
          <h2>Đơn hàng hiện tại: #{order.id}</h2>
          <p><strong>Người nhận:</strong> {order.shipping.name} - {order.shipping.phone}</p>
          <p><strong>Địa chỉ:</strong> {order.shipping.address}</p>
          <p><strong>Trạng thái:</strong> <span style={{ color: 'red', fontWeight: 'bold' }}>{order.status.toUpperCase()}</span></p>
          
          <div style={{ gap: '10px', display: 'flex' }}>
            <button onClick={() => updateStatus('confirmed')} disabled={order.status !== 'pending'}>Xác nhận (Seller)</button>
            <button onClick={() => updateStatus('shipping')} disabled={order.status !== 'confirmed'}>Giao hàng (Mover)</button>
            <button onClick={() => updateStatus('done')} disabled={order.status !== 'shipping'}>Hoàn thành</button>
            <button onClick={() => updateStatus('cancel')} disabled={order.status === 'done'}>Hủy đơn</button>
          </div>
        </div>
      )}

      {/* Lịch sử đơn hàng */}
      <h2>Lịch sử đơn hàng</h2>
      <ul>
        {history.map((o) => (
          <li key={o.id}>
            <strong>#{o.id}</strong> | Trạng thái: {o.status} | Ngày: {o.createdAt}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Order;
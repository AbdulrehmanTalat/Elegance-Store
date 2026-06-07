const fs = require('fs');

let content = fs.readFileSync('app/admin/orders/page.tsx', 'utf8');

// 1. Update Order interface
content = content.replace(
  /createdAt: string\n  items: OrderItem\[\]\n\}/,
  `createdAt: string\n  items: OrderItem[]\n  trackingId?: string | null\n  courier?: string | null\n}`
);

// 2. Add state variables
content = content.replace(
  /const \[expandedOrderId, setExpandedOrderId\] = useState<string \| null>\(null\)/,
  `const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)\n  const [pendingStatus, setPendingStatus] = useState<{ [orderId: string]: string }>({})\n  const [trackingInfo, setTrackingInfo] = useState<{ [orderId: string]: { trackingId: string, courier: string } }>({})`
);

// 3. Update updateOrderStatus function
content = content.replace(
  /const updateOrderStatus = async \(orderId: string, newStatus: string\) => \{/,
  `const updateOrderStatus = async (orderId: string, newStatus: string, trackingId?: string, courier?: string) => {`
);

content = content.replace(
  /body: JSON\.stringify\(\{ status: newStatus \}\),/,
  `body: JSON.stringify({ status: newStatus, trackingId, courier }),`
);

// 4. Update the UI for status select and tracking inputs
const uiTarget = `{/* Status Update */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Update Status
                        </label>
                        <div className="flex items-center gap-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={updatingOrderId === order.id}
                            className="flex-1 max-w-xs border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                          {updatingOrderId === order.id && (
                            <span className="text-sm text-primary-600 flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                              Updating & sending email...
                            </span>
                          )}
                        </div>
                      </div>`;

const uiReplacement = `{/* Status Update */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Update Status
                        </label>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <select
                              value={pendingStatus[order.id] || order.status}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                setPendingStatus({ ...pendingStatus, [order.id]: newStatus });
                                if (newStatus !== 'SHIPPED' && newStatus !== order.status) {
                                  updateOrderStatus(order.id, newStatus);
                                }
                              }}
                              disabled={updatingOrderId === order.id}
                              className="flex-1 max-w-xs border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                            {updatingOrderId === order.id && (
                              <span className="text-sm text-primary-600 flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                Updating & sending email...
                              </span>
                            )}
                          </div>

                          {(pendingStatus[order.id] === 'SHIPPED' || (!pendingStatus[order.id] && order.status === 'SHIPPED')) && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
                              <h4 className="font-semibold text-blue-900 mb-3">Shipping Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-blue-800 mb-1">Courier Company</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. TCS, Leopard" 
                                    value={trackingInfo[order.id]?.courier || order.courier || ''}
                                    onChange={(e) => setTrackingInfo({...trackingInfo, [order.id]: {...(trackingInfo[order.id] || {}), courier: e.target.value}})}
                                    className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-blue-800 mb-1">Tracking ID</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. 123456789" 
                                    value={trackingInfo[order.id]?.trackingId || order.trackingId || ''}
                                    onChange={(e) => setTrackingInfo({...trackingInfo, [order.id]: {...(trackingInfo[order.id] || {}), trackingId: e.target.value}})}
                                    className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                  />
                                </div>
                              </div>
                              {pendingStatus[order.id] === 'SHIPPED' && pendingStatus[order.id] !== order.status && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'SHIPPED', trackingInfo[order.id]?.trackingId, trackingInfo[order.id]?.courier)}
                                  disabled={updatingOrderId === order.id}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                  Save & Send Email
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>`;

content = content.replace(uiTarget, uiReplacement);

fs.writeFileSync('app/admin/orders/page.tsx', content);
console.log('UI updated successfully!');

'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MarketCarPages.css';

interface Itenis {
    id: number;
    titulo: string;
    preco: number;
    categoria: string;
    marca: string;
    imagemPrincipal: string;
    imagensGaleria: string[];
}

interface IShoppingItem {
    produto: Itenis;
    quantidade: number;
    tamanho: number;
}

const MarketCarPages = () => {
    const [tenis, setTenis] = useState<Itenis[]>([]);
    const [shoppingTenis, setShoppingTenis] = useState<IShoppingItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('todos');
    const [selectedBrand, setSelectedBrand] = useState<string>('All');
    const [selectedTenis, setSelectedTenis] = useState<Itenis | null>(null);
    const [showGallery, setShowGallery] = useState<boolean>(false);
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [selectedSize, setSelectedSize] = useState<number>(34);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [showCart, setShowCart] = useState<boolean>(false);

    useEffect(() => {
        axios.get('https://df42fbf9-3df0-4372-b92b-d095ced18946-00-s55d11r25lmq.riker.replit.dev/produtos')
            .then(response => setTenis(response.data))
            .catch(error => console.error('Erro ao buscar dados da API:', error));
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    const handleAddTenis = (id: number) => {
        const teni = tenis.find((teni) => teni.id === id);
        if (!teni) return;

        const carItem: IShoppingItem = {
            produto: teni,
            quantidade: selectedQuantity,
            tamanho: selectedSize
        };

        const existingItem = shoppingTenis.find(item => item.produto.id === id && item.tamanho === selectedSize);

        if (existingItem) {
            const newShoppingTenis = shoppingTenis.map(item => {
                if (item.produto.id === id && item.tamanho === selectedSize) {
                    return {
                        ...item,
                        quantidade: item.quantidade + selectedQuantity
                    };
                }
                return item;
            });
            setShoppingTenis(newShoppingTenis);
        } else {
            setShoppingTenis([...shoppingTenis, carItem]);
        }

        setShowMenu(false); // Fecha o menu flutuante
    };

    const handleRemoveTenis = (id: number) => {
        const newShoppingTenis = shoppingTenis.map(item => {
            if (item.produto.id === id) {
                const newQuantity = item.quantidade > 0 ? item.quantidade - 1 : 0;
                return {
                    ...item,
                    quantidade: newQuantity
                };
            }
            return item;
        }).filter(item => item.quantidade > 0);

        setShoppingTenis(newShoppingTenis);
    };

    const handleRemoveAllOfType = (id: number) => {
        const newShoppingTenis = shoppingTenis.filter(item => item.produto.id !== id);
        setShoppingTenis(newShoppingTenis);
    };

    const calculateTotalPrice = () => {
        return shoppingTenis.reduce((total, item) => total + (item.quantidade * item.produto.preco), 0);
    };

    const handleCategoryFilter = (category: string) => {
        setSelectedCategory(category);
        setSelectedBrand('All'); // Resetar a marca selecionada ao mudar a categoria
    };

    const handleBrandFilter = (brand: string) => {
        setSelectedBrand(brand);
    };

    const printReceipt = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        const receiptContent = document.getElementById('receipt-content');
        
        if (!receiptContent) {
            console.error('Não foi possível encontrar o conteúdo da nota fiscal.');
            return;
        }
    
        // Cria o conteúdo filtrado para impressão
        let content = '<h1>Nota Fiscal</h1>';
        content += '<table style="width: 100%; border-collapse: collapse;">';
        content += '<thead><tr><th>Produto</th><th>Quantidade</th><th>Preço Unitário</th><th>Total</th></tr></thead>';
        content += '<tbody>';
    
        const shoppingItems = shoppingTenis.map(item => {
            const total = item.quantidade * item.produto.preco;
            return `
                <tr>
                    <td>${item.produto.titulo}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${item.produto.preco.toFixed(2).replace('.', ',')}</td>
                    <td>R$ ${total.toFixed(2).replace('.', ',')}</td>
                </tr>
            `;
        }).join('');
    
        content += shoppingItems;
        content += '</tbody>';
        content += `<tfoot><tr><td colspan="3" style="text-align: right;"><strong>Total Geral:</strong></td><td><strong>R$ ${calculateTotalPrice().toFixed(2).replace('.', ',')}</strong></td></tr></tfoot>`;
        content += '</table>';
    
        if (printWindow) {
            printWindow.document.write('<html><head><title>Nota Fiscal</title>');
            printWindow.document.write('<style>body{font-family: Arial, sans-serif; padding: 20px;} table{width: 100%; border-collapse: collapse;} th, td{border: 1px solid #ddd; padding: 8px;} th{background-color: #f2f2f2;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(content);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        } else {
            console.error('Não foi possível abrir a janela de impressão.');
        }
    };
        
    // Filtrando por categoria e marca
    const filteredTenis = tenis.filter(teni => 
        (selectedCategory === 'todos' || teni.categoria === selectedCategory) &&
        (selectedBrand === 'All' || teni.marca === selectedBrand)
    );

    // Obtendo marcas únicas para a categoria filtrada
    const availableBrands = [...new Set(tenis.filter(teni => selectedCategory === 'todos' || teni.categoria === selectedCategory).map(teni => teni.marca))];

    const themeToggleBtn = document.querySelector('.theme-toggle');
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode'); // Alterna a classe dark-mode no body
    }

    return (
        <div className={`container ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="sidebar">
                <h2>Filtrar por Categoria</h2>
                <ul>
                    <li>
                        <button className={selectedCategory === 'todos' ? 'active' : ''} onClick={() => handleCategoryFilter('todos')}>
                            Todos os Itens
                        </button>
                    </li>
                    <li>
                        <button className={selectedCategory === 'tenis' ? 'active' : ''} onClick={() => handleCategoryFilter('tenis')}>
                            Tênis
                        </button>
                    </li>
                    <li>
                        <button className={selectedCategory === 'bolas' ? 'active' : ''} onClick={() => handleCategoryFilter('bolas')}>
                            Bolas
                        </button>
                    </li>
                    <li>
                        <button className={selectedCategory === 'acessorios' ? 'active' : ''} onClick={() => handleCategoryFilter('acessorios')}>
                            Acessórios
                        </button>
                    </li>
                </ul>

                {availableBrands.length > 0 && (
                    <>
                        <h2>Filtrar por Marca</h2>
                        <ul>
                            <li>
                                <button className={selectedBrand === 'All' ? 'active' : ''} onClick={() => handleBrandFilter('All')}>
                                    Todas as Marcas
                                </button>
                            </li>
                            {availableBrands.map((brand, index) => (
                                <li key={index}>
                                    <button
                                        className={selectedBrand === brand ? 'active' : ''}
                                        onClick={() => handleBrandFilter(brand)}
                                    >
                                        {brand}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
            <div className="main-content">
                <h1 className="page-header">Kicks and Co.</h1>
                <div className="product-grid">
                    {filteredTenis.map(teni => (
                        <div className="product-card" key={teni.id}>
                            <img
                                src={teni.imagemPrincipal}
                                alt={teni.titulo}
                                className="product-image"
                                onClick={() => {
                                    setSelectedTenis(teni);
                                    setShowGallery(true);
                                }}
                            />
                            <p>{teni.titulo}</p>
                            <p>R$ {teni.preco.toFixed(2).replace('.', ',')}</p>
                            <button onClick={() => {
                                setSelectedTenis(teni);
                                setShowMenu(true);
                            }}>Adicionar</button>
                        </div>
                    ))}
                </div>
                {showGallery && selectedTenis && (
                    <div className="gallery-modal">
                        <div className="gallery-content">
                            <span className="close-gallery" onClick={() => setShowGallery(false)}>&times;</span>
                            <img src={selectedTenis.imagemPrincipal} alt={selectedTenis.titulo} className="gallery-main-image" />
                            <div className="gallery-thumbnails">
                                {selectedTenis.imagensGaleria.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="gallery-thumbnail"
                                        onClick={() => (document.querySelector('.gallery-main-image') as HTMLImageElement).src = img}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {showMenu && selectedTenis && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <span className="close-modal" onClick={() => setShowMenu(false)}>×</span>
                            <img src={selectedTenis.imagemPrincipal} alt={selectedTenis.titulo} className="modal-product-image" />
                            <h2>Selecionar Tamanho e Quantidade</h2>
                            {selectedTenis.categoria === 'tenis' && (
                                <>
                                    <label htmlFor="size">Tamanho:</label>
                                    <select
                                        id="size"
                                        value={selectedSize}
                                        onChange={(e) => setSelectedSize(parseInt(e.target.value))}
                                    >
                                        {[...Array(10).keys()].map(i => (
                                            <option key={i + 34} value={i + 34}>{i + 34}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                            <label htmlFor="quantity">Quantidade:</label>
                            <input
                                type="number"
                                id="quantity"
                                min="1"
                                value={selectedQuantity}
                                onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                            />
                            <button className="button-style" onClick={() => handleAddTenis(selectedTenis.id)}>Adicionar ao Carrinho</button>
                        </div>
                    </div>
                )}
            </div>
            <button className="cart-toggle-button" onClick={() => setShowCart(!showCart)}>
                {showCart ? '×' : '🛒'}
            </button>
            {showCart && (
                <div className={`cart-summary ${showCart ? 'active' : ''}`}>
                    <div id="receipt-content">
                        <h1>Carrinho de Compras: <span>R$ {calculateTotalPrice().toFixed(2).replace('.', ',')}</span></h1>
                        <ul className="cart-list">
                            {shoppingTenis.map(item => (
                                <li key={item.produto.id}>
                                    <img src={item.produto.imagemPrincipal} alt={item.produto.titulo} className="cart-image" />
                                    <div className="cart-item-details">
                                        <p>Produto: {item.produto.titulo}</p>
                                        <p>Preço: R$ {item.produto.preco.toFixed(2).replace('.', ',')}</p>
                                        <p>Quantidade: {item.quantidade}</p>
                                        <p>Tamanho: {item.tamanho}</p>
                                        <p>Total: R$ {(item.quantidade * item.produto.preco).toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div className="cart-buttons">
                                        <button className="button-style-remo1" onClick={() => handleRemoveTenis(item.produto.id)}>Remover 1</button>
                                        <button className="button-style-remoAll" onClick={() => handleRemoveAllOfType(item.produto.id)}>Remover Todos</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button className="print-button" onClick={printReceipt}>Imprimir Nota Fiscal</button>
                    </div>
                </div>
            )}
            <button className="theme-toggle" onClick={toggleDarkMode}>
                {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            </button>
        </div>
    );
};

export default MarketCarPages;

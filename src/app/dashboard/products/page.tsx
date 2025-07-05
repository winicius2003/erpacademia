"use client"

import * as React from "react"
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getProducts, addProduct, updateProduct, deleteProduct, type Product } from "@/services/products"
import { Badge } from "@/components/ui/badge"

const initialFormState = {
  id: "",
  name: "",
  price: 0,
  stock: 0,
};

type ProductFormData = typeof initialFormState;

export default function ProductsPage() {
    const [products, setProducts] = React.useState<Product[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [productFormData, setProductFormData] = React.useState<ProductFormData>(initialFormState);

    const fetchProducts = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            toast({ title: "Erro ao buscar produtos", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddNewClick = () => {
        setIsEditing(false);
        setProductFormData(initialFormState);
        setIsDialogOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setIsEditing(true);
        setProductFormData(product);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = async (productId: string) => {
        try {
            await deleteProduct(productId);
            toast({ title: "Produto Excluído" });
            fetchProducts();
        } catch (error) {
            toast({ title: "Erro ao excluir", variant: "destructive" });
        }
    };
    
    const handleInputChange = (field: keyof ProductFormData, value: any) => {
        setProductFormData(prev => ({ ...prev, [field]: value }))
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSave = {
            name: productFormData.name,
            price: Number(productFormData.price),
            stock: Number(productFormData.stock),
        };

        setIsLoading(true);
        try {
            if (isEditing) {
                await updateProduct(productFormData.id, dataToSave);
                toast({ title: "Produto Atualizado" });
            } else {
                await addProduct(dataToSave);
                toast({ title: "Produto Adicionado" });
            }
            fetchProducts();
        } catch (error) {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    const getStockVariant = (stock: number) => {
        if (stock === 0) return "destructive";
        if (stock <= 10) return "outline";
        return "secondary";
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="font-headline">Produtos</CardTitle>
                            <CardDescription>
                                Gerencie os produtos vendidos em sua academia.
                            </CardDescription>
                        </div>
                        <Button onClick={handleAddNewClick}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-64 w-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Preço (R$)</TableHead>
                                    <TableHead>Estoque</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStockVariant(product.stock)}>
                                                {product.stock > 0 ? `${product.stock} unidades` : "Esgotado"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => handleEditClick(product)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleDeleteClick(product.id)} className="text-destructive">Excluir</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
                    </DialogHeader>
                    <form id="product-form" onSubmit={handleSaveProduct}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome do Produto</Label>
                                <Input id="name" value={productFormData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Ex: Garrafa de Água" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Preço (R$)</Label>
                                    <Input id="price" type="number" step="0.01" value={productFormData.price} onChange={e => handleInputChange('price', e.target.value)} placeholder="25.00" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Estoque</Label>
                                    <Input id="stock" type="number" value={productFormData.stock} onChange={e => handleInputChange('stock', e.target.value)} placeholder="50" />
                                </div>
                            </div>
                        </div>
                    </form>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" form="product-form">{isEditing ? "Salvar Alterações" : "Salvar Produto"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

/**
 * Mascara o CPF exibindo apenas os 3 primeiros dígitos e os 2 dígitos verificadores.
 * Ex: "12345678909" → "123.***.***-09"
 */
export function mascaraCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return '***.***.***-**';
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9, 11)}`;
}

/**
 * Mascara o nome exibindo apenas o primeiro nome completo e
 * a inicial + asteriscos do último sobrenome.
 * Ex: "João da Silva Santos" → "João S*****"
 *     "Maria"               → "Ma***"
 */
export function mascaraNome(nome: string): string {
  if (!nome) return '***';
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 1) {
    const n = partes[0];
    return n.slice(0, 2) + '*'.repeat(Math.max(3, n.length - 2));
  }

  const primeiro = partes[0];
  const ultimo = partes[partes.length - 1];
  const mascarado = ultimo[0] + '*'.repeat(Math.max(3, ultimo.length - 1));

  return `${primeiro} ${mascarado}`;
}

/**
 * Retorna apenas o primeiro nome (para saudações).
 */
export function primeiroNome(nome: string): string {
  if (!nome) return '';
  return nome.trim().split(/\s+/)[0];
}

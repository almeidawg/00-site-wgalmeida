import React from 'react';
import {cleanup,render,screen} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';

vi.mock('@/components/SEO',()=>({default:()=>null}));
vi.mock('@/components/WGEasyEstimateCalculator',()=>({default:()=> <p>Estimativa sem homologação indisponível</p>}));
vi.mock('@/components/ICCRILinksBlock',()=>({default:()=>null}));
vi.mock('@/lib/motion-lite',()=>({motion:{
 h1:({children,initial,animate,transition,...props})=><h1 {...props}>{children}</h1>,
 p:({children,initial,animate,transition,...props})=><p {...props}>{children}</p>,
}}));
vi.mock('react-router-dom',()=>({Link:({children,to,...props})=><a href={to} {...props}>{children}</a>}));
vi.mock('@/data/company',()=>({
 PRODUCT_URLS:{obraeasy:'https://obraeasy.example.com',easyrealstate:'https://easy.example.com'},
 WG_PRODUCT_MESSAGES:{marketReferences:'Mercado necessita de referências homologadas'},
}));
vi.mock('@/data/commercialGovernance',()=>({
 getCommercialService:()=>({sourceOfTruth:'legado não reconciliado'}),
 getCommercialPackages:()=>[{key:'essencial',label:'Essencial',rangeLabel:'R$ 1.500 a R$ 2.500'}]
}));

import ICCRI from '@/pages/ICCRI';

afterEach(cleanup);
describe('ICCRI copy and navigation release protection',()=>{
 it('does not claim unvalidated historic ranges are a real published price',()=>{
  render(<ICCRI/>);
  expect(screen.getByText(/As tabelas de preços de reforma estão em reconciliação/)).toBeInTheDocument();
  expect(screen.queryByText(/R\$ 1\.500 a R\$ 2\.500/)).not.toBeInTheDocument();
  expect(screen.getByText(/valor a confirmar após análise técnica/)).toBeInTheDocument();
  expect(screen.queryByText(/Como referência isolada, ele abre uma faixa/)).not.toBeInTheDocument();
 });
 it('uses accessible touch targets for ICCRI CTA and sidebar links',()=>{
  render(<ICCRI/>);
  const cta=screen.getByRole('link',{name:/Explorar análise de viabilidade/i});
  expect(cta.className).toContain('min-h-[44px]');
  const related=screen.getByRole('link',{name:/Tabela ICCRI 2026/i});
  expect(related.className).toContain('min-h-[44px]');
 });
});

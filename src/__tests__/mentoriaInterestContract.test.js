import { describe, expect, it } from 'vitest'
import { validateMentoriaInterest } from '@/lib/mentoriaInterestContract'
import handler from '../../api/mentoria-interest.js'

const valid = {
  context:'mentoria_construcao',program:'individual_8_weeks_8x90_minutes',
  name:'Pessoa Sintética QA',company:'Empresa Exemplo',email:'qa@example.test',
  phone:'11999990000',role:'Gestor',segment:'Reformas e manutenção',
  priority:'ia',challenge:'Precisamos organizar o atendimento e a gestão das obras.',
  privacyConsent:true,website:'',utm_source:'qa',utm_medium:'email',utm_campaign:'',
}
const makeResponse = () => {
  const output={code:0,headers:{},body:null}
  const res={
    setHeader(name,value){output.headers[name]=value;return this},
    status(code){output.code=code;return this},
    json(value){output.body=value;return this},
  }
  return {res,output}
}

describe('Mentoria interesse: contrato próprio e API pública fail-closed',()=>{
  it('valida apenas dados mínimos, consentidos, e atribuição sem PII',()=>{
    const result=validateMentoriaInterest(valid)
    expect(result.ok).toBe(true)
    expect(result.data).toMatchObject({name:valid.name,company:valid.company,privacyConsent:true,priority:'ia'})
    expect(result.data.attribution).toEqual({utm_source:'qa',utm_medium:'email'})
    expect(result.data).not.toHaveProperty('website')
    expect(Object.isFrozen(result.data)).toBe(true)
  })
  it.each([
    ['sem consentimento',{privacyConsent:false},'CONSENT_REQUIRED'],
    ['contexto externo',{context:'contato_site'},'WRONG_CONTEXT'],
    ['programa adulterado',{program:'mentoria_automatica'},'WRONG_CONTEXT'],
    ['honeypot preenchido',{website:'bot.example'},'HONEYPOT'],
    ['e-mail inválido',{email:'sem-email'},'INVALID_EMAIL'],
    ['telefone insuficiente',{phone:'1234'},'INVALID_PHONE'],
    ['segmento desconhecido',{segment:'financeiro'},'INVALID_SEGMENT'],
    ['prioridade inválida',{priority:'checkout'},'INVALID_PRIORITY'],
    ['desafio curto',{challenge:'curto'},'CHALLENGE_REQUIRED'],
    ['UTM contaminada',{utm_source:'<script>alert(1)</script>'},'INVALID_ATTRIBUTION'],
    ['nome longo',{name:'x'.repeat(121)},'IDENTITY_REQUIRED'],
    ['campo inesperado',{cpf:'99999999999'},'EXTRA_FIELDS'],
  ])('nega %s sem expor dados',(_name,mutation,reason)=>{
    const input={...valid,...mutation}
    const result=validateMentoriaInterest(input)
    expect(result).toEqual({ok:false,reason})
    expect(JSON.stringify(result)).not.toContain(input.name)
    expect(JSON.stringify(result)).not.toContain(input.email)
  })
  it('nega objetos nulos, arrays e atributos inválidos',()=>{
    for(const input of [undefined,null,[],42,'test'])expect(validateMentoriaInterest(input).ok).toBe(false)
  })
  it('POST na API pública retorna 503, sem ler corpo nem gravar CRM',()=>{
    const {res,output}=makeResponse()
    const req={method:'POST',get body(){throw Error('DO_NOT_READ_PERSONAL_DATA')}}
    handler(req,res)
    expect(output.code).toBe(503)
    expect(output.body).toMatchObject({ok:false,code:'MENTORIA_INTAKE_NOT_APPROVED'})
    expect(JSON.stringify(output)).not.toContain(valid.email)
    expect(output.headers['Cache-Control']).toContain('no-store')
    expect(output.headers['X-Robots-Tag']).toContain('noindex')
  })
  it('API nega GET e preflight, não habilita CORS permissivo',()=>{
    for(const method of ['GET','OPTIONS','PUT','DELETE']){
      const {res,output}=makeResponse()
      handler({method},res)
      expect(output.code).toBe(405)
      expect(output.headers.Allow).toBe('POST')
      expect(output.headers['Access-Control-Allow-Origin']).toBeUndefined()
    }
  })
})
